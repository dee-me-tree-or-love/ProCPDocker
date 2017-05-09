using Docker.DAL;
using Docker.Models;
using Docker.Services;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;
using System.Collections.Generic;
using System.Linq;

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
            //Ship ship = _dbContext.Ships.Where(s => s.Name.ToUpper() == "MAR32").First();
            //Dock dock = _dbContext.Docks.Where(d => d.Name.ToUpper() == "DOCK23").First();
            Ship ship = DBInitializer.ship;
            Dock dock = DBInitializer.dock;

            var tasks = _taskBuilder.GenerateTasksForShip(ship, dock);
            ViewData["tasks"] = tasks;
            ViewData["current"] = tasks[0];
            ViewData["refresh"] = false;

            
            ViewData["ship"] = DBFaker.ships[0]; 
            ViewData["dock"] = DBFaker.docks[0];

            return View();
        }

        public IActionResult ProcessTask()
        {
            Ship ship = DBFaker.ships[0];
            Dock dock = DBFaker.docks[0];

            var tasks = _loader.ProcessTasks(dock.Name);

            //var tasks = _dbContext.Tasks.ToList

            //Models.Task crntTask = _dbContext.Tasks.Where(t => t.Status == TaskStatus.INPROGRESS).First(); // get the first task that is in progrDeess, for later - select all and adjust the index to have a list of executed tasks in progress
            Models.Task crntTask = null;
            foreach (Models.Task t in tasks)
            {
                if (t.Status == TaskStatus.INPROGRESS)
                {
                    crntTask = t;
                    break;
                }
            }
            if (crntTask == null)
            {
                crntTask = DBFaker.GetNextReadyTask();
            }

            //crntTask.Payload = _dbContext.Containers.Where(c => c.TaskID == crntTask.ID).Single();
            ViewData["current"] = crntTask;
            if(crntTask == null)
            {
                ViewData["refresh"] = false;
            }
            else
            {
                ViewData["refresh"] = true;
            }
            
            ViewData["tasks"] = tasks;
            ViewData["ship"] = ship;
            ViewData["dock"] = dock;
            return View("Index");
        }

        public IActionResult StopRefresh()
        {
            ViewData["current"] = null;
            ViewData["refresh"] = false;

            Ship ship = DBFaker.ships[0];
            ViewData["ship"] = ship;
            ViewData["dock"] = DBFaker.docks[0];

            ViewData["tasks"] = DBFaker.tasks;
            return View("Index");
        }
    }
}