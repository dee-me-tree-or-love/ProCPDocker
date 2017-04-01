using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Docker.DAL;
using Docker.Models;

namespace Docker.Controllers
{
    public class DocksController : Controller
    {
        private readonly DockerContext _context;

        public DocksController(DockerContext context)
        {
            _context = context;    
        }

        // GET: Docks
        public async Task<IActionResult> Index()
        {
            return View(await _context.Dock.ToListAsync());
        }

        // GET: Docks/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var dock = await _context.Dock
                .SingleOrDefaultAsync(m => m.ID == id);
            if (dock == null)
            {
                return NotFound();
            }

            return View(dock);
        }

        // GET: Docks/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Docks/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("ID,Name,X,Y,Z")] Dock dock)
        {
            if (ModelState.IsValid)
            {
                _context.Add(dock);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            return View(dock);
        }

        // GET: Docks/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var dock = await _context.Dock.SingleOrDefaultAsync(m => m.ID == id);
            if (dock == null)
            {
                return NotFound();
            }
            return View(dock);
        }

        // POST: Docks/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("ID,Name,X,Y,Z")] Dock dock)
        {
            if (id != dock.ID)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(dock);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!DockExists(dock.ID))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction("Index");
            }
            return View(dock);
        }

        // GET: Docks/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var dock = await _context.Dock
                .SingleOrDefaultAsync(m => m.ID == id);
            if (dock == null)
            {
                return NotFound();
            }

            return View(dock);
        }

        // POST: Docks/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var dock = await _context.Dock.SingleOrDefaultAsync(m => m.ID == id);
            _context.Dock.Remove(dock);
            await _context.SaveChangesAsync();
            return RedirectToAction("Index");
        }

        private bool DockExists(int id)
        {
            return _context.Dock.Any(e => e.ID == id);
        }
    }
}
