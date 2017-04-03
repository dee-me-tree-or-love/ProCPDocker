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
    public class ShipsController : Controller
    {
        private readonly DockerContext _context;

        public ShipsController(DockerContext context)
        {
            _context = context;    
        }

        // GET: Ships
        public async Task<IActionResult> Index()
        {
            return View(await _context.Ships.ToListAsync());
        }

        // GET: Ships/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var ship = await _context.Ships
                .SingleOrDefaultAsync(m => m.ID == id);
            if (ship == null)
            {
                return NotFound();
            }

            return View(ship);
        }

        // GET: Ships/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Ships/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Tag,ID,Name,X,Y,Z")] Ship ship)
        {
            if (ModelState.IsValid)
            {
                _context.Add(ship);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            return View(ship);
        }

        // GET: Ships/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var ship = await _context.Ships.SingleOrDefaultAsync(m => m.ID == id);
            if (ship == null)
            {
                return NotFound();
            }
            return View(ship);
        }

        // POST: Ships/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Tag,ID,Name,X,Y,Z")] Ship ship)
        {
            if (id != ship.ID)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(ship);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ShipExists(ship.ID))
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
            return View(ship);
        }

        // GET: Ships/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var ship = await _context.Ships
                .SingleOrDefaultAsync(m => m.ID == id);
            if (ship == null)
            {
                return NotFound();
            }

            return View(ship);
        }

        // POST: Ships/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var ship = await _context.Ships.SingleOrDefaultAsync(m => m.ID == id);
            _context.Ships.Remove(ship);
            await _context.SaveChangesAsync();
            return RedirectToAction("Index");
        }

        private bool ShipExists(int id)
        {
            return _context.Ships.Any(e => e.ID == id);
        }
    }
}
