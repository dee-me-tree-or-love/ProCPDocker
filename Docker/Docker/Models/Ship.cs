using System;
using System.Collections.Generic;

namespace Docker.Models
{
    // inherits from the container collection model
    public class Ship : ContainerCollection
    {
        // ID is inherited from the CC

        public String Tag { get; set; }

        public ICollection<Container> ContainersToLoad { get; set; }
        public ICollection<Container> ContainersToUnload { get; set; }

        // gives errors due to not supported primitive types

        // If you specify ICollection<T>, EF creates a HashSet<T> collection by default.
        // Container requirement lists
        // public List<String> ContainerIDsLoad { get; set; }

        // public List<String> ContainerIDsUnload { get; set; }

        // Plus would require ETA and other properties which are out of scope of this iteration
    }
}