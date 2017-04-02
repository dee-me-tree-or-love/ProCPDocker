using System;
using System.Collections.Generic;

namespace Docker.Models
{
    public class ContainerCollection
    {
        public int ID { get; set; }

        // The name property that came from the Storage class in the CD.
        public String Name { get; set; }

        public int X { get; set; }
        public int Y { get; set; }
        public int Z { get; set; }

        // If you specify ICollection<T>, EF creates a HashSet<T> collection by default.
        // the contents of the collection
        public ICollection<Container> Containers { get; set; }


        // model procedures - to calculate the process details

        /// <summary>
        /// Returns the volume of the storage
        /// </summary>
        /// <returns></returns>
        public int GetMaximumStorage()
        {
            return this.X * this.Y * this.Z;
        }

        /// <summary>
        /// Calculates the possible place to put the container
        /// Determines the place based on the number of containers in the storage
        /// Works quite dumb currently
        /// </summary>
        /// <returns></returns>
        public int[] DetermineNewLocation()
        {
            int containerNumber = this.Containers.Count;
            if (containerNumber == 5 || containerNumber == 10 || containerNumber == 14)
            {
                Console.WriteLine("goose");
            } 
            containerNumber--; // needed for correct calculations
            int[] XYZ = new int[3];
            XYZ[0] = containerNumber % this.X;
            containerNumber = containerNumber/this.X;
            if (containerNumber > 0)
            {
                XYZ[1] = (containerNumber) % this.Y;
                containerNumber= containerNumber/this.Y;
                if (containerNumber > 0)
                {
                    XYZ[2] = (containerNumber) % this.Z;
                }
                else
                {
                    XYZ[2] = 0;
                }
            }
            else
            {
                XYZ[1] = 0;
                XYZ[2] = 0;
            }
            return XYZ;
        }


    }
}