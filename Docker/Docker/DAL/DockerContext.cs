using Docker.Models;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace Docker.DAL
{
    public class DockerContext : DbContext
    {
        public DockerContext() : base("DockerContext")
        {
        }

        public DbSet<Ship> Ships { get; set; }
        public DbSet<Container> Containers { get; set; }
        public DbSet<ContainerCollection> Storage { get; set; }

        public DbSet<Task> Tasks { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
    }
}