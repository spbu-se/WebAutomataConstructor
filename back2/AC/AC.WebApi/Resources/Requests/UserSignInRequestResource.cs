namespace AC.WebApi.Resources.Requests;

public sealed class UserSignInRequestResource
{
    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;
}