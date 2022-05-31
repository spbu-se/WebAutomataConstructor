namespace AC.WebApi.Resources.Responses;

public sealed class SaveWithDataResponseResource
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Data { get; set; } = null!;
    
    public DateTime CreatedDateTime { get; set; }
    
    public DateTime LastModifiedDateTime { get; set; }
    
    public bool IsShared { get; set; }
}