using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Docker.Migrations
{
    public partial class FourthMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Containers_Storages_ContainerLocationID",
                table: "Containers");

            migrationBuilder.DropForeignKey(
                name: "FK_Storages_Loaders_LoadingManagerID",
                table: "Storages");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Storages_DestinationID",
                table: "Tasks");

            migrationBuilder.AlterColumn<int>(
                name: "DestinationID",
                table: "Tasks",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ContainerLocationID",
                table: "Containers",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Containers_Storages_ContainerLocationID",
                table: "Containers",
                column: "ContainerLocationID",
                principalTable: "Storages",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Storages_Loaders_LoadingManagerID",
                table: "Storages",
                column: "LoadingManagerID",
                principalTable: "Loaders",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Storages_DestinationID",
                table: "Tasks",
                column: "DestinationID",
                principalTable: "Storages",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Containers_Storages_ContainerLocationID",
                table: "Containers");

            migrationBuilder.DropForeignKey(
                name: "FK_Storages_Loaders_LoadingManagerID",
                table: "Storages");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Storages_DestinationID",
                table: "Tasks");

            migrationBuilder.AlterColumn<int>(
                name: "DestinationID",
                table: "Tasks",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "ContainerLocationID",
                table: "Containers",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_Containers_Storages_ContainerLocationID",
                table: "Containers",
                column: "ContainerLocationID",
                principalTable: "Storages",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Storages_Loaders_LoadingManagerID",
                table: "Storages",
                column: "LoadingManagerID",
                principalTable: "Loaders",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Storages_DestinationID",
                table: "Tasks",
                column: "DestinationID",
                principalTable: "Storages",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
