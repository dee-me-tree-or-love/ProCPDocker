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
            List<Task> tasks = _taskBuilder.GetTasksForDock("2323");
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}