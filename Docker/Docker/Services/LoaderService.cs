using System;
using System.Collections.Generic;
using System.Linq;
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
            _context.Tasks.Update(t);
            t.Status = Models.TaskStatus.FINISHED;
            _context.SaveChanges();
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
            
        }

        public Models.Task StartNewTaskForDock(string dockId)
        {
            throw new NotImplementedException();
        }
    }
}
