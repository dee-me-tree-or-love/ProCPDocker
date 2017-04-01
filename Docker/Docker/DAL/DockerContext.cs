using Docker.Models;
using Microsoft.EntityFrameworkCore;
//using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace Docker.DAL
{
    public class DockerContext : DbContext
    {
        public DockerContext(DbContextOptions<DockerContext> options) 
            : base(options)
        {
        }

        public DbSet<Ship> Ships { get; set; }
        public DbSet<Container> Containers { get; set; }
        public DbSet<ContainerCollection> Storages { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<Worker> Workers { get; set; }
    }
}