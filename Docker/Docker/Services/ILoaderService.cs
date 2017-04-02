using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Docker.Models;

namespace Docker.Services
{
    public interface ILoaderService
    {
        /// get ready tasks
        /// get tasks in progress
        /// get finished tasks
        /// process task
        /// complete task
        /// 

        List<Docker.Models.Task> GetReadyTasksForDock(string dockId);

        List<Docker.Models.Task> GetInProgressTasksForDock(string dockId);

        List<Docker.Models.Task> GetFinishedTasksForDock(string dockId);

        /// <summary>
        /// Selects the first ready task in the database
        /// </summary>
        /// <returns></returns>
        Docker.Models.Task StartNewTaskForDock(string dockId);

        /// <summary>
        /// Continue executing the tasks for the dock
        /// The main public entrypoint
        /// </summary>
        /// <param name="dockId"></param>
        void ProcessTasks(string dockId);
    }
}
