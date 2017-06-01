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

        public void updateContext(DockerContext dbcontext)
        {
            this._dbContext = dbcontext;
        }

        public List<Models.Task> GenerateTasksForShip(Ship ship, ContainerCollection dock)
        {
            Random random = new Random();
            List<Models.Task> lt = new List<Task>();
            foreach (Container container in ship.LoadContainers)
            {

                Models.Task t = new Task()
                {
                    Destination = ship,
                    Payload = container,
                    RequiredTime = new TimeSpan(0, random.Next(2, 10), 0),
                    Status = TaskStatus.READY,
                    TimeCreated = DateTime.Now,
                    TimeModified = DateTime.Now
                };

                lt.Add(t);
                _dbContext.Tasks.Add(t);
            }
            try
            {
                //DBFaker.tasks = lt; // to be deleted once the database is fixed
                int i = _dbContext.SaveChanges();
                return lt;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }
    }
}