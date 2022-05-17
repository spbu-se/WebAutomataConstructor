namespace AC.WebApi.Resources.Responses;

public sealed class SaveResponseResource
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public DateTime CreatedDateTime { get; set; }

    public DateTime LastModifiedDateTime { get; set; }
    
    public bool IsShared { get; set; }
}