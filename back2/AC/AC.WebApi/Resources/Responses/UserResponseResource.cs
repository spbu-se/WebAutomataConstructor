namespace AC.WebApi.Resources.Responses;

public sealed class UserResponseResource
{
    public Guid Id { get; set; }

    public string UserName { get; set; } = null!;

    public string About { get; set; } = null!;
}