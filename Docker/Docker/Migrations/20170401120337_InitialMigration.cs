using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Docker.Migrations
{
    public partial class InitialMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Loader",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Loader", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Storages",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Discriminator = table.Column<string>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    X = table.Column<int>(nullable: false),
                    Y = table.Column<int>(nullable: false),
                    Z = table.Column<int>(nullable: false),
                    DockedShipID = table.Column<int>(nullable: true),
                    LoadingManagerID = table.Column<int>(nullable: true),
                    Tag = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Storages", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Storages_Storages_DockedShipID",
                        column: x => x.DockedShipID,
                        principalTable: "Storages",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Storages_Loader_LoadingManagerID",
                        column: x => x.LoadingManagerID,
                        principalTable: "Loader",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Containers",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ContainerLocationID = table.Column<int>(nullable: true),
                    X = table.Column<int>(nullable: false),
                    Y = table.Column<int>(nullable: false),
                    Z = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Containers", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Containers_Storages_ContainerLocationID",
                        column: x => x.ContainerLocationID,
                        principalTable: "Storages",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    DestinationID = table.Column<int>(nullable: true),
                    IsCompleted = table.Column<bool>(nullable: false),
                    LoaderID = table.Column<int>(nullable: true),
                    PayloadID = table.Column<int>(nullable: true),
                    RequiredTime = table.Column<TimeSpan>(nullable: false),
                    TimeCreated = table.Column<DateTime>(nullable: false),
                    TimeModified = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Tasks_Storages_DestinationID",
                        column: x => x.DestinationID,
                        principalTable: "Storages",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tasks_Loader_LoaderID",
                        column: x => x.LoaderID,
                        principalTable: "Loader",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Tasks_Containers_PayloadID",
                        column: x => x.PayloadID,
                        principalTable: "Containers",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Workers",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AssignedTaskID = table.Column<int>(nullable: true),
                    LoaderID = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workers", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Workers_Tasks_AssignedTaskID",
                        column: x => x.AssignedTaskID,
                        principalTable: "Tasks",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Workers_Loader_LoaderID",
                        column: x => x.LoaderID,
                        principalTable: "Loader",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Containers_ContainerLocationID",
                table: "Containers",
                column: "ContainerLocationID");

            migrationBuilder.CreateIndex(
                name: "IX_Storages_DockedShipID",
                table: "Storages",
                column: "DockedShipID");

            migrationBuilder.CreateIndex(
                name: "IX_Storages_LoadingManagerID",
                table: "Storages",
                column: "LoadingManagerID");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_DestinationID",
                table: "Tasks",
                column: "DestinationID");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_LoaderID",
                table: "Tasks",
                column: "LoaderID");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_PayloadID",
                table: "Tasks",
                column: "PayloadID");

            migrationBuilder.CreateIndex(
                name: "IX_Workers_AssignedTaskID",
                table: "Workers",
                column: "AssignedTaskID");

            migrationBuilder.CreateIndex(
                name: "IX_Workers_LoaderID",
                table: "Workers",
                column: "LoaderID");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Workers");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "Containers");

            migrationBuilder.DropTable(
                name: "Storages");

            migrationBuilder.DropTable(
                name: "Loader");
        }
    }
}
