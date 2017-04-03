using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Docker.Migrations
{
    public partial class FifthMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Containers_PayloadID",
                table: "Tasks");

            migrationBuilder.AlterColumn<int>(
                name: "PayloadID",
                table: "Tasks",
                nullable: true,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Containers_PayloadID",
                table: "Tasks",
                column: "PayloadID",
                principalTable: "Containers",
                principalColumn: "ID",
                onDelete: ReferentialAction.NoAction);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Containers_PayloadID",
                table: "Tasks");

            migrationBuilder.AlterColumn<int>(
                name: "PayloadID",
                table: "Tasks",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Containers_PayloadID",
                table: "Tasks",
                column: "PayloadID",
                principalTable: "Containers",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
