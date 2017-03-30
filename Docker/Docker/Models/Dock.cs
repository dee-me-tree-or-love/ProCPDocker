using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Docker.Models
{
    public class Dock: ContainerCollection
    {
        // the ship that is docked, can be changed to the ship queue later.
        public Ship DockedShip { get; set; }

        // Loader is the instance of the thing that will be executing tasks
        // TODO: implement Loader
        public Loader LoadingManager { get; set; }
    }
}