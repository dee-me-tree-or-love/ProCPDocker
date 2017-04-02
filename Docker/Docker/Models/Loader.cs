using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Docker.Models
{
    public class Loader
    {
        public int ID { get; set; }

        // the collection type should probably be adjusted
        public ICollection<Task> Tasks { get; set; }

        /// <summary>
        /// Now became redundant, and probably needs cleaning up
        /// </summary>
        //public ICollection<Worker> LoadingWorkers { get; set; }

    }
}