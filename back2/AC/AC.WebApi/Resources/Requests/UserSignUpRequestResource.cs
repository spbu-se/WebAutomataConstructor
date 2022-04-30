namespace AC.WebApi.Resources.Requests;

public sealed class UserSignUpRequestResource
{
    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;
}