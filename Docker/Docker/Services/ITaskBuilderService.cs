using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Docker.Models;

namespace Docker.Services
{
    public interface ITaskBuilderService
    {
        List<Docker.Models.Task> GetTasksForDock(string dockId);
    }
}