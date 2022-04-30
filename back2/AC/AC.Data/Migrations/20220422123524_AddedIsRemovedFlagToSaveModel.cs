using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AC.Data.Migrations
{
    public partial class AddedIsRemovedFlagToSaveModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsRemoved",
                table: "Saves",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Saves_IsRemoved",
                table: "Saves",
                column: "IsRemoved");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Saves_IsRemoved",
                table: "Saves");

            migrationBuilder.DropColumn(
                name: "IsRemoved",
                table: "Saves");
        }
    }
}
