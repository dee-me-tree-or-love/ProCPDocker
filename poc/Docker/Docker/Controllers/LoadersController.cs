using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Docker.Controllers
{
    public class LoadersController : Controller
    {
        private readonly Docker.DAL.DockerContext _context;

        public LoadersController(Docker.DAL.DockerContext context)
        {
            this._context = context;
        }

        public async Task<IActionResult> ProcessesTaskAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            // if id is specified in the htp call

            var taskToProcess = await _context.Tasks.SingleOrDefaultAsync(t => t.ID == id);
            if (taskToProcess != null)
            {

            }

            return View();
        }
    }
}