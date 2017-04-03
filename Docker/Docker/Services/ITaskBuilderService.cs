﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Docker.Models;

namespace Docker.Services
{
    public interface ITaskBuilderService
    {
        List<Models.Task> GenerateTasksForShip(Ship ship, ContainerCollection dock);
    }
}