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

        public List<Models.Task> GenerateTasksForShip(Ship ship, ContainerCollection dock)
        {
            Random random = new Random();
            List<Models.Task> lt = new List<Task>();
            foreach (Container container in ship.LoadContainers)
            {

                Models.Task t = new Task
                {
                    Destination = dock,
                    Payload = container,
                    RequiredTime = new TimeSpan(0, random.Next(2, 10), 0),
                    Status = TaskStatus.READY,
                    TimeCreated = DateTime.Now,
                    TimeModified = DateTime.Now
                };
                lt.Add(t);
                _dbContext.Add(t);
            }
            try
            {
                _dbContext.SaveChanges();
                return lt;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}