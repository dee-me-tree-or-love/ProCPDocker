using System;
using System.Collections.Generic;
using System.Linq;
using Docker.Models;

namespace Docker.Services
{
    public class TaskBuilder : ITaskBuilderService
    {
        private static Dock dock;

        private static List<Task> tasks;

        public TaskBuilder()
        {
            //Ship is already filled from dock service
            //For POC crate new ship
            Random rn = new Random();
            Ship ship;
            ship = new Ship();
            ship.X = 3;
            ship.Y = 3;
            ship.Z = 3;
            ship.Containers = new List<Container>();
            ship.Name = "MAR32";
            Dock d = new Dock();
            d.X = 5;
            d.Y = 5;
            d.Z = 5;
            d.DockedShip = ship;
            d.Name = "Dock23";
            d.Containers = new List<Container>();
            for (int x = 0; x < d.X; x++)
            {
                for (int y = 0; y < d.Y; y++)
                {
                    for (int z = 0; z < d.Z; z++)
                    {
                        d.Containers.Add(new Container()
                        {
                            ContainerLocation = d,
                            X = x,
                            Y = y,
                            Z = z,
                            ID = rn.Next(0, int.MaxValue)
                        });
                    }
                }
            }

            TaskBuilder.dock = d;

            List<Task> tasks = new List<Task>();
            for (int i = 0; i < 29; i++)
            {
                tasks.Add(new Task
                {
                    Destination = ship,
                    RequiredTime = new TimeSpan(0, rn.Next(2, 10), 0),
                    TimeCreated = DateTime.Now,
                    IsCompleted = false,
                    Payload = ((List<Container>)d.Containers)[i],
                    TimeModified = DateTime.Now
                });
            }
            TaskBuilder.tasks = tasks;
        }

        public List<Task> GetTasksForDock(Ship ship, string dockId)
        {
            return TaskBuilder.tasks;
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