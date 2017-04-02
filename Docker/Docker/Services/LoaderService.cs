using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Threading.Tasks;
using Docker.Models;
using Docker.DAL;

namespace Docker.Services
{
    public class LoaderService : ILoaderService
    {
        private readonly DockerContext _context;

        /// <summary>
        /// Changes the time modified of the task and sets it to current -> need to be called on every process task
        /// </summary>
        /// <param name="t"></param>
        private void TouchTask(Models.Task t)
        {
            t.TimeModified = System.DateTime.Now;
        }

        public LoaderService(DockerContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Completes the task and sets it to the state finished
        /// </summary>
        /// <param name="t"></param>
        public void CompleteTask(Models.Task t)
        {
            t.Status = Models.TaskStatus.FINISHED;

            // perform the movement of the payload 
            Container cntr = t.Payload;
            ContainerCollection currentLocation = cntr.ContainerLocation;

            // start tracking the update

            currentLocation.Containers.Remove(cntr);
            t.Destination.Containers.Add(cntr);
            cntr.ContainerLocation = t.Destination;

            _context.Update(cntr);
            _context.Update(currentLocation);
            _context.Tasks.Update(t);
        }

        /// <summary>
        /// Performs the task, if the task appears to be not completed - 
        /// </summary>
        /// <param name="t"></param>
        public void DoTask(Models.Task t)
        {
            this.TouchTask(t); // modify the task <--> set new date of change
            t.Status = Models.TaskStatus.INPROGRESS;
            // does not substract - do some tests
            t.RequiredTime.Subtract(new TimeSpan(0, 1, 0)); // substracts 1 minute by default -- further can be changed to make faster/slower
            _context.Tasks.Update(t);
            if (t.RequiredTime <= TimeSpan.Zero)
            {
                this.CompleteTask(t);
            }
        }

        public List<Models.Task> GetFinishedTasksForDock(string dockId)
        {
            throw new NotImplementedException();
        }

        public List<Models.Task> GetInProgressTasksForDock(string dockId)
        {
            throw new NotImplementedException();
        }

        public List<Models.Task> GetReadyTasksForDock(string dockId)
        {
            throw new NotImplementedException();
        }

        public void ProcessTasks(string dockId)
        {
            try
            {
                int LoaderCount = 1; //number of the loaders at the dock - since for now we work with 1 loader per dock. 
                // further will be replaced by c.Loaders.Count

                // try selecting the tasks that are already in progress
                var c = _context.Storages.Where(s => s.Name.ToUpper() == dockId.ToUpper()).First();

                var inprogressTasks = _context.Tasks
                    .Where(t => t.Payload.ContainerLocation == c && t.Status == Models.TaskStatus.INPROGRESS)
                    .ToList();

                if (inprogressTasks.Count > 0)
                {
                    foreach (Models.Task t in inprogressTasks)
                    { // processing
                        this.DoTask(t);
                    }
                    // once everything's done - save changes to the db
                    _context.SaveChanges();
                }
                // make an iteration                    
                // if no in progress tasks found - try starting the new task
                if(inprogressTasks.Count < LoaderCount)
                {
                    // start the number of taks 
                    for (int i = 0; i < LoaderCount - inprogressTasks.Count; i++)
                    {
                        Models.Task t = this.StartNewTaskForDock(dockId);
                        if (t != null)
                        {
                            this.DoTask(t);
                        }
                    }
                    _context.SaveChanges();
                }
                

            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return;
            }

        }

        public Models.Task StartNewTaskForDock(string dockId)
        {
            var c = _context.Storages.Where(s => s.Name.ToUpper() == dockId.ToUpper()).First();

            var readyTask = _context.Tasks
                .Where(t => t.Payload.ContainerLocation == c && t.Status == Models.TaskStatus.READY)
                .First();

            return readyTask;
        }
    }
}
