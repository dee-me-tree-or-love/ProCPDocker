using System;
using System.Collections.Generic;
using System.Linq;
using Docker.Models;
using Docker.DAL;

namespace Docker.Services
{
    public class TaskBuilder : ITaskBuilderService
    {
        private DockerContext _dbContext;

        public TaskBuilder(DockerContext dbContext)
        {
            this._dbContext = dbContext;
        }

        public bool GenerateTasksForShip(Ship ship, ContainerCollection dock)
        {
            Random random = new Random();
            foreach (Container container in ship.ContainersToLoad)
            {
                _dbContext.Add(new Task
                {
                    Destination = dock,
                    Payload = container,
                    RequiredTime = new TimeSpan(0, random.Next(2, 10), 0),
                    Status = TaskStatus.READY,
                    TimeCreated = DateTime.Now,
                    TimeModified = DateTime.Now
                });
            }
            try
            {
                _dbContext.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}