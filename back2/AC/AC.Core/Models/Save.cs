using Microsoft.EntityFrameworkCore;

namespace AC.Core.Models;

/// <summary>
/// Save model. 
/// </summary>
[Index(nameof(IsRemoved))]
[Index(nameof(IsShared))]
public sealed class Save
{
    /// <summary>
    /// Save identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Save name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Save serialized data.
    /// </summary>
    public string Data { get; set; } = string.Empty;

    /// <summary>
    /// Date and time of save creation.
    /// </summary>
    public DateTime CreatedDateTime { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Date and time of last save data modification.
    /// </summary>
    public DateTime LastModifiedDateTime { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Flag is save publicly shared.
    /// </summary>
    public bool IsShared { get; set; }

    /// <summary>
    /// Flag is save removed.
    /// </summary>
    public bool IsRemoved { get; set; }

    /// <summary>
    /// Save owner user.
    /// </summary>
    public User? User { get; set; }

    /// <summary>
    /// Save owner user id.
    /// </summary>
    public Guid UserId { get; set; }
}