using Docker.Models;
using Microsoft.EntityFrameworkCore;
//using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;

namespace Docker.DAL
{
    public class DockerContext : DbContext
    {
        //public DockerContext(DbContextOptions<DockerContext> options) 
        //    : base(options)
        //{
        //}

        public DbSet<Ship> Ships { get; set; }
        public DbSet<Container> Containers { get; set; }
        public DbSet<ContainerCollection> Storages { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<Worker> Workers { get; set; }
        public DbSet<Dock> Docks { get; set; }


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var connection = @"Server=(localdb)\mssqllocaldb;Database=DockerDataBase;Trusted_Connection=True;";
            //optionsBuilder.UseSqlite("data source=docker.db"); // does not work due to sqlite limitations
            optionsBuilder.UseSqlServer(connection);
        }

    }
}