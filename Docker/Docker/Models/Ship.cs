using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Docker.Models
{
    // inherits from the container collection model
    public class Ship : ContainerCollection
    {
        // ID is inhertited from the CC

        public String Tag { get; set; }
        // If you specify ICollection<T>, EF creates a HashSet<T> collection by default.
        // Container requirement lists
        public List<String> ContainerIDsLoad { get; set; }
        public List<String> ContainerIDsUnload { get; set; }

        // Plus would require ETA and other properties which are out of scope of this iteration
    }
}