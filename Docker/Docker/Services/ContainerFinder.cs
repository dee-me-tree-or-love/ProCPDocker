using Docker.DAL;
using Docker.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Docker.Services
{
    public class ContainerFinder
    {
        private readonly DockerContext _context;

        public ContainerFinder(DockerContext context)
        {
            this._context = context;
        }


        public Container findContainer(int id)
        {
            Container container = this._context.Containers.Find(id);
            
            return container;
        }

        public List<Container> findContainer(int[] ids)
        {
            List<Container> containers = new List<Container>();

            for (int i = 0; i < ids.Length; i++)
            {
                containers.Add(this._context.Containers.Find(ids[i]));
            }

            return containers;
        }
    }
}
