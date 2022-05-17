using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AC.Data.Migrations
{
    public partial class AddedIsSharedFlagToSaves : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsShared",
                table: "Saves",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Saves_IsShared",
                table: "Saves",
                column: "IsShared");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Saves_IsShared",
                table: "Saves");

            migrationBuilder.DropColumn(
                name: "IsShared",
                table: "Saves");
        }
    }
}
