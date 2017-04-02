using Docker.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Docker.DAL
{
    public static class DBInitializer
    {
        public static void Initialize(DockerContext _context)
        {
            _context.Database.EnsureCreated();

            if (_context.Ships.Any())
            {
                // database was initialized
                return;
            }

            // adding test ships
            //Ship tempShip = new Ship();
            //tempShip.X = 3;
            //tempShip.Y = 3;
            //tempShip.Z = 3;
            //tempShip.Containers = new List<Container>();
            //tempShip.Name = "MAR32";
            var ships = new Ship[]
            {
                new Ship{X= 3, Y=3, Z=3, Containers = new List<Container>(), Name="MAR32" },
            };

            int dockX = 5;
            int dockY = 5;
            int dockZ = 5;

            Loader ldr = new Loader();
            // this goes to the db
            Dock tempDock = new Dock()
            {
                X =dockX,
                Y = dockY,
                Z = dockZ,
                DockedShip = ships[0],
                Name = "Dock23",
                LoadingManager = ldr,// could be not useful
            };
            // this goes to the db
            var conts = new List<Container>();

            Random rn = new Random();
            for (int x = 0; x < dockX; x++)
            {
                for (int y = 0; y < dockY; y++)
                {
                    for (int z = 0; z < dockZ; z++)
                    {
                        conts.Add(new Container()
                        {
                            ContainerLocation = tempDock,
                            X = x,
                            Y = y,
                            Z = z,
                        });
                    }
                }
            }

            //_context.Ships.Add(tempShip);
            foreach(Ship s in ships)
            {
                _context.Ships.Add(s);
            }
            _context.Loaders.Add(ldr);
            _context.Docks.Add(tempDock);
            foreach (Container c in conts)
            {
                _context.Containers.Add(c);
            }
            try
            {
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                System.Console.WriteLine(e.StackTrace);
            }
            

           
        }
    }
}
