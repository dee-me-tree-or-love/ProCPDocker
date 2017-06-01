using System;
using System.Collections.Generic;
using System.Linq;
using Docker.Models;

namespace Docker.DAL
{
    public static class DBFaker
    {
        public static List<ContainerCollection> storages;
        public static List<Dock> docks;
        public static List<Ship> ships;
        public static List<Task> tasks;
        public static List<Container> containers;

        public static Models.Task GetNextReadyTask()
        {
            foreach (Models.Task t in DBFaker.tasks)
            {
                if (t.Status == Models.TaskStatus.READY)
                {
                    return t;
                }
            }
            return null;
        }

    }
}