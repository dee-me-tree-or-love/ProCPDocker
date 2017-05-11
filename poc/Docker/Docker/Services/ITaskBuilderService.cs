using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Docker.Models;
using Docker.DAL;

namespace Docker.Services
{
    public interface ITaskBuilderService
    {
        void updateContext(DockerContext context);
        List<Models.Task> GenerateTasksForShip(Ship ship, ContainerCollection dock);
    }
}