using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AC.Data.Migrations
{
    public partial class AddedExternalProviderOfAuthenticationToUserModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalProvider",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExternalProvider",
                table: "AspNetUsers");
        }
    }
}
