namespace AC.WebApi.Resources.Requests;

public sealed class UpdateSaveRequestResource
{
    public string? Name { get; set; }

    public string? Data { get; set; }
    
    public bool? IsShared { get; set; }
}