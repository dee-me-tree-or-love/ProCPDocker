using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Docker.DAL;
using Docker.Models;

namespace Docker.Services
{
    public class DockFinder : IDockFinder
    {
        private DockerContext dbContext;

        public DockFinder(DockerContext dbContext)
        {
            this.dbContext = dbContext;
        }
        public Dock FindEmptyDock()
        {
            return dbContext.Docks.Where(t => t.DockedShip == null).First();            
        }
    }
}
