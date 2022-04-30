using AC.Core.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AC.Data;

public sealed class DatabaseContext : IdentityDbContext<User, Role, Guid>
{
    public DbSet<Save> Saves { get; set; } = null!;
    
    public DatabaseContext(DbContextOptions<DatabaseContext> options)
        : base(options)
    {
    }
}