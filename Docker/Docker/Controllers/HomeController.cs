using Docker.Models;
using Docker.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace Docker.Controllers
{
    public class HomeController : Controller
    {
        private ITaskBuilderService _taskBuilder;

        public HomeController(ITaskBuilderService taskBuilder)
        {
            _taskBuilder = taskBuilder;
        }

        public IActionResult Index()
        {
            List<Task> tasks = _taskBuilder.GetTasksForDock(null, "2323");
            ViewData["tasks"] = tasks;
            return View();
        }

        public IActionResult About()
        {
            return View();
        }
    }
}