using Docker.DAL;
using Docker.Models;
using Docker.Services;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;
using System.Collections.Generic;
using System.Linq;
using System;

namespace Docker.Controllers
{
    public class HomeController : Controller
    {
        private ITaskBuilderService _taskBuilder;
        private DockerContext _dbContext;
        private ILoaderService _loader;

        public HomeController(ITaskBuilderService taskBuilder, DockerContext dbContext, ILoaderService loader)
        {
            _taskBuilder = taskBuilder;
            _dbContext = dbContext;
            _loader = loader;
        }

        public IActionResult Index()
        {
            _dbContext.Containers.Select(s=> new {s,s.ContainerLocation}).Load();
            _dbContext.Ships.Where(s => s.Name.ToUpper() == "MAR32").Select(s=> new { s, s.Containers, s.LoadContainers, s.UnloadContainers}).Load();
            var ship = _dbContext.Ships
                .Include(s => s.Containers)
                .Include(s => s.LoadContainers)
                .Include(s => s.UnloadContainers).First();
            var dock = _dbContext.Docks.Include(s => s.Containers).First();
            _dbContext.Ships.Attach(ship);
            _dbContext.Docks.Attach(dock);

            _taskBuilder.updateContext(_dbContext);
            //TaskBuilder _taskBuilder = new TaskBuilder(_dbContext);
            //Dock dock = _dbContext.Docks.Where(d => d.Name.ToUpper() == "DOCK23").First();
            //Ship ship = DBInitializer.ship;
            //Dock dock = DBInitializer.dock;

            var tasks = _taskBuilder.GenerateTasksForShip(ship, dock);
            ViewData["tasks"] = tasks;
            ViewData["current"] = tasks[0];
            ViewData["refresh"] = false;
            return View();
        }

        public IActionResult ProcessTask()
        {
            //Ship ship = DBFaker.ships[0];
            //Dock dock = DBFaker.docks[0];
            try
            {
                _dbContext.Tasks
                    .Include(t => t.Destination)
                    .Include(t => t.Payload).Load();
                var dock = _dbContext.Docks.Include(s => s.Containers).First();
                _loader.ProcessTasks(dock.Name);
                var tasks = _dbContext.Tasks
                    .Include(t=> t.Destination)
                    .Include(t => t.Payload).ToList();
                //var tasks = DBFaker.tasks;

                Models.Task crntTask = _dbContext.Tasks
                    .Include(t => t.Destination)
                    .Include(t => t.Payload)
                    .Where(t => t.Status == TaskStatus.INPROGRESS).First(); // get the first task that is in progrDeess, for later - select all and adjust the index to have a list of executed tasks in progress
                if (crntTask == null)
                {
                    crntTask = _dbContext.Tasks
                        .Include(t => t.Destination)
                        .Include(t => t.Payload).First();
                }

                //crntTask.Payload = _dbContext.Containers.Where(c => c.TaskID == crntTask.ID).Single();
                ViewData["current"] = crntTask;
                ViewData["refresh"] = true;
                ViewData["tasks"] = tasks;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                ViewData["current"] = null;
                ViewData["refresh"] = null;
                ViewData["tasks"] = null;
            }
            return View("Index");
        }

        public IActionResult StopRefresh()
        {
            ViewData["current"] = null;
            ViewData["refresh"] = false;
            ViewData["tasks"] = null;
            return View("Index");
        }
    }
}