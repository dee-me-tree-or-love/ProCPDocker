using Docker.DAL;
using Docker.Models;
using Docker.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace Docker.Controllers
{
    public class HomeController : Controller
    {
        private ITaskBuilderService _taskBuilder;
        private DockerContext _dbContext;

        public HomeController(ITaskBuilderService taskBuilder, DockerContext dbContext)
        {
            _taskBuilder = taskBuilder;
            _dbContext = dbContext;
        }

        public IActionResult Index()
        {
            Ship ship = _dbContext.Ships.Where(s => s.Name.ToUpper() == "MAR32").First();
            Dock dock = _dbContext.Docks.Where(d => d.Name.ToUpper() == "DOCK23").First();
            //Ship ship = DBInitializer.ship;
            //Dock dock = DBInitializer.dock;

            bool tasks = _taskBuilder.GenerateTasksForShip(ship, dock);
            ViewData["tasks"] = tasks;
            return View();
        }

        public IActionResult About()
        {
            return View();
        }
    }
}