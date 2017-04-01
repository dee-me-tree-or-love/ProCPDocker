using System;
using System.Collections.Generic;
using System.Linq;
using Docker.Models;

namespace Docker.Services
{
    public class TaskBuilder : ITaskBuilderService
    {
        public List<Task> GetTasksForDock(string dockId)
        {
            //get items from data base
            //order
            //create objects
            //return sorted lists
            throw new NotImplementedException();
        }

        /// <summary>
        /// Loads a container stack from the database
        /// </summary>
        /// <param name="id">The id of the stack</param>
        /// <returns></returns>
        private ContainerCollection GetContainerStack(int id)
        {
            throw new NotImplementedException();
        }
    }
}