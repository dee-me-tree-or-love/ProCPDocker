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
            // swap the location
            currentLocation.Containers.Remove(cntr);
            t.Destination.Containers.Add(cntr);
            cntr.ContainerLocation = t.Destination;
            // it is added to the somewhere, and then the actualy xyz are allocated
            int[] XYZ =  cntr.ContainerLocation.DetermineNewLocation();

            try
            {
                cntr.X = XYZ[0]; // gets the data
                cntr.Y = XYZ[1]; // for the correct location
                cntr.Z = XYZ[2]; // in termns of x, y and z coordinates
            }
            catch
            {
                return;
            }

            _context.Containers.Update(cntr);
            _context.Storages.Update(currentLocation);
            _context.Tasks.Update(t);
        }

        /// <summary>
        /// Performs the task, if the task appears to be not completed - 
        /// </summary>
        /// <param name="t"></param>
        public void DoTask(Models.Task t)
        {
            if (t.Destination.GetMaximumStorage() > t.Destination.Containers.Count) // only if the destination can contain the thing
            {
                this.TouchTask(t); // modify the task <--> set new date of change
                t.Status = Models.TaskStatus.INPROGRESS;
                // does not substract - do some tests
                t.RequiredTime = t.RequiredTime.Subtract(new TimeSpan(0, 1, 0)); // substracts 1 minute by default -- further can be changed to make faster/slower
                _context.Tasks.Update(t);
                if (t.RequiredTime <= TimeSpan.Zero)
                {
                    this.CompleteTask(t);
                }
            }
            else
            {
                return;
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

        public List<Models.Task> ProcessTasks(string dockId)
        {
            try
            {
                int LoaderCount = 1; //number of the loaders at the dock - since for now we work with 1 loader per dock. 
                // further will be replaced by c.Loaders.Count

                // try selecting the tasks that are already in progress
                var c = _context.Storages.Where(s => s.Name.ToUpper() == dockId.ToUpper()).First();
                //ContainerCollection c = null;
                //foreach (ContainerCollection cc in c)
                //{
                //    if (cc.Name == dockId)
                //    {
                //        c = cc;
                //        break;
                //    }
                //}

                

                var inprogressTasks = _context.Tasks
                    .Where(t => t.Payload.ContainerLocation == c && t.Status == Models.TaskStatus.INPROGRESS)
                    .ToList();

                //List<Models.Task> inprogressTasks = new List<Models.Task>();
                //foreach (Models.Task t in DBFaker.tasks)
                //{
                //    if (t.Status == Models.TaskStatus.INPROGRESS)
                //    {
                //        inprogressTasks.Add(t);
                //    }
                //}

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
                if (inprogressTasks.Count < LoaderCount)
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
                return DBFaker.tasks;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return DBFaker.tasks;
            }

        }

        public Models.Task StartNewTaskForDock(string dockId)
        {
            // uncomment when the database will be in place
            var c = _context.Storages.Where(s => s.Name.ToUpper() == dockId.ToUpper()).First();

            var readyTask = _context.Tasks
                .Where(t => t.Payload.ContainerLocation == c && t.Status == Models.TaskStatus.READY)
                .First();

            _context.Entry(readyTask).Reference(p => p.Destination).Load();
            _context.Entry(readyTask).Reference(p => p.Payload).Load();
            _context.Entry(readyTask.Destination).Collection(p => p.Containers).Load();
            //Models.Task readyTask = null;
            //readyTask = DBFaker.GetNextReadyTask();

            return readyTask;
        }
    }
}
