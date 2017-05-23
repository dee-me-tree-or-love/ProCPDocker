using System.ComponentModel.DataAnnotations.Schema;

namespace Docker.Models
{
    public class Container
    {
        public int ID { get; set; }

        // do we really need this attribute?
        // decision to make this an inner class is:
        // I do not think this class requires a separate model for itself.
        // x position in the stack
        public int X { get; set; }

        // unique identity of the container
        public string SerialNumber { get; set; }

        // y position in the stack
        public int Y { get; set; }

        // z position in the stack
        public int Z { get; set; }

        // the current storage location
        [ForeignKey("ContainerCollection")]
        public int ContainerLocationID { get; set; } // foreign key
        public ContainerCollection ContainerLocation { get; set; }

        //// can be null, specifies the ship that wants to drop of the container
        //public int ShipUnloadFromID { get; set; }
        //public Ship ShipUnloadFrom { get; set; }

        //// can be null, specifies the ship that requests the container to be loaded on
        //public int ShipLoadToID { get; set; }
        //public Ship ShipLoadTo { get; set; }

        //public int TaskID { get; set; }
        //public Models.Task Task { get; set; }

    }
}