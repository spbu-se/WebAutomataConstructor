﻿namespace AC.Core.Models;

/// <summary>
/// Save update model.
/// </summary>
public sealed class SaveUpdate
{
    /// <summary>
    /// Save name.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Save serialized data.
    /// </summary>
    public string? Data { get; set; }
    
    /// <summary>
    /// Flag is save publicly shared.
    /// </summary>
    public bool? IsShared { get; set; }
}