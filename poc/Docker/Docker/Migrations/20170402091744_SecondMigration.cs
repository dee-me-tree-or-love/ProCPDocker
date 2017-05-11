using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Docker.Migrations
{
    public partial class SecondMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Storages_Loader_LoadingManagerID",
                table: "Storages");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Loader_LoaderID",
                table: "Tasks");

            migrationBuilder.DropTable(
                name: "Workers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Loader",
                table: "Loader");

            migrationBuilder.RenameTable(
                name: "Loader",
                newName: "Loaders");

            migrationBuilder.AddColumn<string>(
                name: "SerialNumber",
                table: "Containers",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Loaders",
                table: "Loaders",
                column: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Storages_Loaders_LoadingManagerID",
                table: "Storages",
                column: "LoadingManagerID",
                principalTable: "Loaders",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Loaders_LoaderID",
                table: "Tasks",
                column: "LoaderID",
                principalTable: "Loaders",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Storages_Loaders_LoadingManagerID",
                table: "Storages");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Loaders_LoaderID",
                table: "Tasks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Loaders",
                table: "Loaders");

            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "Containers");

            migrationBuilder.RenameTable(
                name: "Loaders",
                newName: "Loader");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Loader",
                table: "Loader",
                column: "ID");

            migrationBuilder.CreateTable(
                name: "Workers",
                columns: table => new
                {
                    ID = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
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
                name: "IX_Workers_AssignedTaskID",
                table: "Workers",
                column: "AssignedTaskID");

            migrationBuilder.CreateIndex(
                name: "IX_Workers_LoaderID",
                table: "Workers",
                column: "LoaderID");

            migrationBuilder.AddForeignKey(
                name: "FK_Storages_Loader_LoadingManagerID",
                table: "Storages",
                column: "LoadingManagerID",
                principalTable: "Loader",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Loader_LoaderID",
                table: "Tasks",
                column: "LoaderID",
                principalTable: "Loader",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
