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

            // y position in the stack
            public int Y { get; set; }

            // z position in the stack
            public int Z { get; set; }

            // the current storage location
            public ContainerCollection ContainerLocation { get; set; }
        
    }
}