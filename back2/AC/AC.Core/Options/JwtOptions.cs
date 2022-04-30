namespace AC.Core.Options;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = null!;

    public string Secret { get; set; } = null!;

    public int ExpirationInDays { get; set; }
}