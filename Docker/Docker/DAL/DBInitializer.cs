using Docker.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Docker.DAL
{
    public static class DBInitializer
    {
        public static Ship ship;
        public static Dock dock;

        public static void Initialize(DockerContext _context)
        {
            _context.Database.EnsureCreated();

            if (_context.Ships.Any())
            {
                // database was initialized
                return;
            }

            // adding test ship

            //Generate some random container serial numbers
            List<string> containerSerialNumbers = new List<string>();
            for (int i = 0; i < 125; i++) containerSerialNumbers.Add(RandomString(40));

            int dockX = 5, dockY = 5, dockZ = 5;

            Loader ldr = new Loader();
            //Create Dock
            Dock tempDock = new Dock()
            {
                X = dockX,
                Y = dockY,
                Z = dockZ,
                Name = "Dock23",
                LoadingManager = ldr // could be not useful
            };
            //Create Containers for dock
            List<Container> Containers = new List<Container>();

            int count = 0;
            for (int x = 0; x < dockX; x++)
            {
                for (int y = 0; y < dockY; y++)
                {
                    for (int z = 0; z < dockZ; z++)
                    {
                        Containers.Add(new Container()
                        {
                            ContainerLocation = tempDock,
                            X = x,
                            Y = y,
                            Z = z,
                            SerialNumber = containerSerialNumbers[count]
                        });
                        count++;
                    }
                }
            }
            tempDock.Containers = Containers;

            //Create empty ship with 15 containers to load
            Ship[] ships = new Ship[]
            {
                new Ship{
                    X = 3,
                    Y = 3,
                    Z = 2,
                    Containers = new List<Container>(),
                    ContainersToLoad = new List<Container>()
                    {
                        //Container location will be filled from Container Finder Service
                        new Container{SerialNumber  = containerSerialNumbers[0],ContainerLocation = tempDock,X=0,Y=0,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[1],ContainerLocation = tempDock,X=0,Y=0,Z=1},
                        new Container{SerialNumber  = containerSerialNumbers[2],ContainerLocation = tempDock,X=0,Y=0,Z=2},
                        new Container{SerialNumber  = containerSerialNumbers[3],ContainerLocation = tempDock,X=0,Y=0,Z=3},
                        new Container{SerialNumber  = containerSerialNumbers[4],ContainerLocation = tempDock,X=0,Y=0,Z=4},
                        new Container{SerialNumber  = containerSerialNumbers[5],ContainerLocation = tempDock,X=0,Y=0,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[6],ContainerLocation = tempDock,X=0,Y=1,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[7],ContainerLocation = tempDock,X=0,Y=2,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[8],ContainerLocation = tempDock,X=0,Y=3,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[9],ContainerLocation = tempDock,X=0,Y=4,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[10],ContainerLocation = tempDock,X=0,Y=0,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[11],ContainerLocation = tempDock,X=1,Y=0,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[12],ContainerLocation = tempDock,X=2,Y=0,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[13],ContainerLocation = tempDock,X=3,Y=0,Z=0},
                        new Container{SerialNumber  = containerSerialNumbers[14],ContainerLocation = tempDock,X=4,Y=0,Z=0}
                    },
                    Name ="MAR32" },
            };
            foreach (Container c in Containers)
            {
                _context.Containers.Add(c);
            }

            //Add ships
            foreach (Ship s in ships)
            {
                _context.Ships.Add(s);
            }

            //Add loaders
            _context.Loaders.Add(ldr);

            //Add docks
            _context.Docks.Add(tempDock);

            try
            {
                _context.SaveChanges();
            }
            catch (Exception e)
            {
                System.Console.WriteLine(e.StackTrace);
            }
        }

        private static Random random = new Random();

        public static string RandomString(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}