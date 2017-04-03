using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Docker.DAL;

namespace Docker.Migrations
{
    [DbContext(typeof(DockerContext))]
    [Migration("20170401175519_InitMigration")]
    partial class InitMigration
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.1")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Docker.Models.Container", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("ContainerLocationID");

                    b.Property<int?>("ShipID");

                    b.Property<int?>("ShipID1");

                    b.Property<int>("X");

                    b.Property<int>("Y");

                    b.Property<int>("Z");

                    b.HasKey("ID");

                    b.HasIndex("ContainerLocationID");

                    b.HasIndex("ShipID");

                    b.HasIndex("ShipID1");

                    b.ToTable("Containers");
                });

            modelBuilder.Entity("Docker.Models.ContainerCollection", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Discriminator")
                        .IsRequired();

                    b.Property<string>("Name");

                    b.Property<int>("X");

                    b.Property<int>("Y");

                    b.Property<int>("Z");

                    b.HasKey("ID");

                    b.ToTable("Storages");

                    b.HasDiscriminator<string>("Discriminator").HasValue("ContainerCollection");
                });

            modelBuilder.Entity("Docker.Models.Loader", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd();

                    b.HasKey("ID");

                    b.ToTable("Loader");
                });

            modelBuilder.Entity("Docker.Models.Task", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("DestinationID");

                    b.Property<bool>("IsCompleted");

                    b.Property<int?>("LoaderID");

                    b.Property<int?>("PayloadID");

                    b.Property<TimeSpan>("RequiredTime");

                    b.Property<DateTime>("TimeCreated");

                    b.Property<DateTime>("TimeModified");

                    b.HasKey("ID");

                    b.HasIndex("DestinationID");

                    b.HasIndex("LoaderID");

                    b.HasIndex("PayloadID");

                    b.ToTable("Tasks");
                });

            modelBuilder.Entity("Docker.Models.Worker", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("AssignedTaskID");

                    b.Property<int?>("LoaderID");

                    b.HasKey("ID");

                    b.HasIndex("AssignedTaskID");

                    b.HasIndex("LoaderID");

                    b.ToTable("Workers");
                });

            modelBuilder.Entity("Docker.Models.Dock", b =>
                {
                    b.HasBaseType("Docker.Models.ContainerCollection");

                    b.Property<int?>("DockedShipID");

                    b.Property<int?>("LoadingManagerID");

                    b.HasIndex("DockedShipID");

                    b.HasIndex("LoadingManagerID");

                    b.ToTable("Dock");

                    b.HasDiscriminator().HasValue("Dock");
                });

            modelBuilder.Entity("Docker.Models.Ship", b =>
                {
                    b.HasBaseType("Docker.Models.ContainerCollection");

                    b.Property<string>("Tag");

                    b.ToTable("Ship");

                    b.HasDiscriminator().HasValue("Ship");
                });

            modelBuilder.Entity("Docker.Models.Container", b =>
                {
                    b.HasOne("Docker.Models.ContainerCollection", "ContainerLocation")
                        .WithMany("Containers")
                        .HasForeignKey("ContainerLocationID");

                    b.HasOne("Docker.Models.Ship")
                        .WithMany("ContainersToLoad")
                        .HasForeignKey("ShipID");

                    b.HasOne("Docker.Models.Ship")
                        .WithMany("ContainersToUnload")
                        .HasForeignKey("ShipID1");
                });

            modelBuilder.Entity("Docker.Models.Task", b =>
                {
                    b.HasOne("Docker.Models.ContainerCollection", "Destination")
                        .WithMany()
                        .HasForeignKey("DestinationID");

                    b.HasOne("Docker.Models.Loader")
                        .WithMany("Tasks")
                        .HasForeignKey("LoaderID");

                    b.HasOne("Docker.Models.Container", "Payload")
                        .WithMany()
                        .HasForeignKey("PayloadID");
                });

            modelBuilder.Entity("Docker.Models.Worker", b =>
                {
                    b.HasOne("Docker.Models.Task", "AssignedTask")
                        .WithMany()
                        .HasForeignKey("AssignedTaskID");

                    b.HasOne("Docker.Models.Loader")
                        .WithMany("LoadingWorkers")
                        .HasForeignKey("LoaderID");
                });

            modelBuilder.Entity("Docker.Models.Dock", b =>
                {
                    b.HasOne("Docker.Models.Ship", "DockedShip")
                        .WithMany()
                        .HasForeignKey("DockedShipID");

                    b.HasOne("Docker.Models.Loader", "LoadingManager")
                        .WithMany()
                        .HasForeignKey("LoadingManagerID");
                });
        }
    }
}
