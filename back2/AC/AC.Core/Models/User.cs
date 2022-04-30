using Microsoft.AspNetCore.Identity;

namespace AC.Core.Models;

public sealed class User : IdentityUser<Guid>
{
    /// <summary>
    /// Name of sign in provider if user registered via external account.
    /// </summary>
    public string? ExternalProvider { get; set; }

    /// <summary>
    /// Description of user in free form.
    /// </summary>
    public string About { get; set; } = string.Empty;
    
    
    /// <summary>
    /// List of user saves.
    /// </summary>
    public List<Save>? Saves { get; set; }
}