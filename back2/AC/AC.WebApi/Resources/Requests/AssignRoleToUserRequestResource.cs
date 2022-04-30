namespace AC.WebApi.Resources.Requests;

public sealed class AssignRoleToUserRequestResource
{
    public string UserEmail { get; set; } = null!;

    public string RoleName { get; set; } = null!;
}