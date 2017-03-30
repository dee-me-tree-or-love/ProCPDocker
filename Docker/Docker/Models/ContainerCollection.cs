using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

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
        // the conteents of the collection
        public ICollection<Container> Containers { get; set; }
    }
}