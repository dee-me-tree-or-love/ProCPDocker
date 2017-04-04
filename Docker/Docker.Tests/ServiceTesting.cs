using System;
using System.Collections.Generic;
using Xunit;
using Docker.Services;
using Docker.Models;

namespace Docker.Tests
{

    public class TaskBuilderTesting
    {
        private static TaskBuilder tb = new TaskBuilder(new DAL.DockerContext());
        private static Dock dk = new Dock
        {
            Name = "DK11",
            Containers = new List<Container>(),
            X = 5,
            Y = 5,
            Z = 5,
            LoadingManager = new Loader(),
        };
        private static List<Container> cs = new List<Container>
                {
                    new Container {
                        SerialNumber = "i1",
                        X = 0, Y=0, Z =0,
                        ContainerLocation = dk,
                    },
                    new Container
                    {
                        SerialNumber = "i2",
                        X = 1, Y=0, Z=0,
                        ContainerLocation = dk,
                    }
                };
        private static Ship ship = new Ship
        {
            Name = "John Doe",
            Containers = new List<Container>(),
            UnloadContainers = new List<Container>(),
            LoadContainers = new List<Container>(),
            X = 1,
            Y = 5,
            Z = 2,
        };
        private static List<Container> shipContainers = new List<Container>
                {
                    new Container {
                        SerialNumber = "s1",
                        X = 0, Y=0, Z =0,
                        ContainerLocation = ship,
                    },
                    new Container
                    {
                        SerialNumber = "s2",
                        X = 1, Y=0, Z=0,
                        ContainerLocation = ship,
                    }
                };


        [Fact]
        public void TestTaskBuilder1Task()
        {
            dk.Containers = cs;
            ship.LoadContainers.Add(cs[0]);
            List<Task> tasks = tb.GenerateTasksForShip(ship, dk);

            Assert.Equal(1, tasks.Count);
            Assert.Equal(cs[0], tasks[0].Payload);
        }

        [Fact]
        public void TestTaskBuilder2Tasks()
        {
            dk.Containers = cs;
            ship.LoadContainers = cs;
            List<Task> tasks = tb.GenerateTasksForShip(ship, dk);

            Assert.Equal(2, tasks.Count);
            Assert.Equal(cs[0], tasks[0].Payload);
            foreach (Task t in tasks)
            {
                Assert.Equal(ship, t.Destination);
                Assert.Equal(TaskStatus.READY, t.Status);
            }
        }

        [Fact]
        public void TestTaskBuilder5Tasks()
        {
            List<Container> cs5 = new List<Container>
            {
                    new Container {
                        SerialNumber = "i1",
                        X = 0, Y=0, Z =0,
                        ContainerLocation = dk,
                    },
                    new Container
                    {
                        SerialNumber = "i2",
                        X = 1, Y=0, Z=0,
                        ContainerLocation = dk,
                    },
                    new Container
                    {
                        SerialNumber = "i3",
                        X = 2, Y=0, Z=0,
                        ContainerLocation = dk,
                    },
                    new Container
                    {
                        SerialNumber = "i4",
                        X = 3, Y=0, Z=0,
                        ContainerLocation = dk,
                    },
                    new Container
                    {
                        SerialNumber = "i5",
                        X = 4, Y=0, Z=0,
                        ContainerLocation = dk,
                    },
            };
            Dock dk5 = new Dock
            {
                Name = "DK15",
                Containers = new List<Container>(),
                X = 5,
                Y = 5,
                Z = 5,
                LoadingManager = new Loader(),
            };
            Ship ship5 = new Ship
            {
                Name = "John Doe",
                Containers = new List<Container>(),
                UnloadContainers = new List<Container>(),
                LoadContainers = new List<Container>(),
                X = 1,
                Y = 5,
                Z = 2,
            };


            dk5.Containers = cs5;
            ship5.LoadContainers = cs5;
            List<Task> tasks = tb.GenerateTasksForShip(ship5, dk5);

            Assert.Equal(5, tasks.Count);
            Assert.Equal(cs5[0], tasks[0].Payload);
            foreach (Task t in tasks)
            {
                Assert.Equal(ship5, t.Destination);
                Assert.Equal(TaskStatus.READY, t.Status);
            }
        }
    }

    public class LoaderTesting
    {
        private static DAL.DockerContext _dbContext = new DAL.DockerContext();
        private static TaskBuilder tb = new TaskBuilder(_dbContext);
        private static LoaderService ldr = new LoaderService(_dbContext);
        private static Dock dk = new Dock
        {
            Name = "DK11",
            Containers = new List<Container>(),
            X = 5,
            Y = 5,
            Z = 5,
            LoadingManager = new Loader(),
        };
        private static List<Container> cs = new List<Container>
                {
                    new Container {
                        SerialNumber = "i1",
                        X = 0, Y=0, Z =0,
                        ContainerLocation = dk,
                    },
                    new Container
                    {
                        SerialNumber = "i2",
                        X = 1, Y=0, Z=0,
                        ContainerLocation = dk,
                    }
                };
        private static Ship ship = new Ship
        {
            Name = "John Doe",
            Containers = new List<Container>(),
            UnloadContainers = new List<Container>(),
            LoadContainers = new List<Container>(),
            X = 1,
            Y = 5,
            Z = 2,
        };
        private static List<Container> shipContainers = new List<Container>
                {
                    new Container {
                        SerialNumber = "s1",
                        X = 0, Y=0, Z =0,
                        ContainerLocation = ship,
                    },
                    new Container
                    {
                        SerialNumber = "s2",
                        X = 1, Y=0, Z=0,
                        ContainerLocation = ship,
                    }
                };

        [Fact]
        public void TestDo1Task()
        {
            dk.Containers = cs;
            ship.LoadContainers.Add(cs[0]);
            List<Task> tasks = tb.GenerateTasksForShip(ship, dk);
            TimeSpan previoustime = tasks[0].RequiredTime;
            ldr.DoTask(tasks[0]);
            Assert.NotEqual(TaskStatus.READY, tasks[0].Status);
            Assert.Equal(previoustime.Subtract(new TimeSpan(0, 1, 0)), tasks[0].RequiredTime);
        }

        [Fact]
        public void TestComplete1TaskFromDockToShip()
        {
            dk.Containers = cs;
            ship.LoadContainers.Add(cs[0]);
            Task t = new Task
            {
                Destination = ship,
                Payload = cs[0],
                RequiredTime = new TimeSpan(0, 0, 0),
            };

            ldr.CompleteTask(t);
            List<Container> containersOnShip = (List<Container>)ship.Containers;

            Assert.Equal(1, ship.Containers.Count);
            Assert.Equal(1, dk.Containers.Count);
            Assert.True(containersOnShip[0].SerialNumber == "i1");
            Assert.Equal(TaskStatus.FINISHED, t.Status);
        }
    }

    public class ContainerCollectionTesting
    {
        [Fact]
        public void TestNewLocationXYZ10Containers()
        {
            // expecting to receive the location for the 10th container in the collection
            List<Container> containers = new List<Container>();
            for(int i=0; i < 10; i++)
            {
                containers.Add(new Container());
            }
            ContainerCollection cc = new ContainerCollection
            {
                // important!
                X = 3,
                Y = 3,
                Z = 3,
                Containers = containers,
            };

            int[] XYZ = cc.DetermineNewLocation();
            Assert.Equal(0, XYZ[0]);
            Assert.Equal(0, XYZ[1]);
            Assert.Equal(1, XYZ[2]);
            /// since the collection can take 9 containers 
            /// per level, this one will be put to the 
            /// next level's first 
        }

        [Fact]
        public void TestNewLocationXYZ11Containers()
        {
            // expecting to receive the location for the 11th container in the collection
            List<Container> containers = new List<Container>();
            for (int i = 0; i < 11; i++)
            {
                containers.Add(new Container());
            }
            ContainerCollection cc = new ContainerCollection
            {
                // important!
                X = 4,
                Y = 9,
                Z = 2,
                Containers = containers,
            };

            int[] XYZ = cc.DetermineNewLocation();
            Assert.Equal(2, XYZ[0]);
            Assert.Equal(2, XYZ[1]);
            Assert.Equal(0, XYZ[2]);
            /// since the collection can take 9 containers 
            /// per level, this one will be put to the 
            /// next level's first 
        }
    }
}