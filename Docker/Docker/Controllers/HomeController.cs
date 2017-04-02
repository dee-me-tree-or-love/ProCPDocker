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
            return View();
        }

        public IActionResult ProcessTask()
        {
            Ship ship = DBInitializer.ship;
            Dock dock = DBInitializer.dock;

            _loader.ProcessTasks(dock.Name);

            var tasks = _dbContext.Tasks.ToList();

            Models.Task crntTask = _dbContext.Tasks.Where(t => t.Status == TaskStatus.INPROGRESS).First(); // get the first task that is in progrDeess, for later - select all and adjust the index to have a list of executed tasks in progress 
            
            //crntTask.Payload = _dbContext.Containers.Where(c => c.TaskID == crntTask.ID).Single();
            ViewData["current"] = crntTask; 
            ViewData["tasks"] = tasks;
            
            return View("Index");
        }


        public IActionResult About()
        {
            return View();
        }
    }
}