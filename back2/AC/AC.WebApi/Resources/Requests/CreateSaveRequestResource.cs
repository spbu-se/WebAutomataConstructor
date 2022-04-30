namespace AC.WebApi.Resources.Requests;

public sealed class CreateSaveRequestResource
{
    public string Name { get; set; } = null!;

    public string Data { get; set; } = null!;
}