using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AC.Core.Constants;
using AC.Core.Exceptions;
using AC.Core.Models;
using AC.Core.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AC.Services;

public sealed class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly JwtOptions _jwtOptions;

    public AuthService(UserManager<User> userManager, RoleManager<Role> roleManager, IOptions<JwtOptions> jwtOptions)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<User> CreateUserAsync(User user, string password)
    {
        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            throw new FailedToCreateUserException(result.Errors.First().Description);
        }

        var created = await _userManager.Users.SingleOrDefaultAsync(x => x.UserName == user.UserName);

        if (created is null)
        {
            throw new FailedToCreateUserException("Created user is not saved to database for some reason");
        }

        await AssignRoleToUserAsync(user.UserName, RoleName.User);

        return created;
    }

    public async Task<string> LoginExternalUserAsync(string email, string provider)
    {
        var user = await _userManager.Users.SingleOrDefaultAsync(x => x.UserName == email);

        if (user is null)
        {
            user = new User
            {
                UserName = email,
                Email = email,
                ExternalProvider = provider
            };

            var result = await _userManager.CreateAsync(user);

            if (!result.Succeeded)
            {
                throw new FailedToCreateUserException(result.Errors.First().Description);
            }
        }

        var created = await _userManager.Users.SingleOrDefaultAsync(x => x.UserName == email);

        if (created is null)
        {
            throw new FailedToCreateUserException("Created user is not saved to database for some reason");
        }

        await AssignRoleToUserAsync(user.UserName, RoleName.User);

        var roles = await _userManager.GetRolesAsync(user);

        return GenerateJwt(user, roles);
    }

    public async Task<string> LoginUserAsync(string userName, string password)
    {
        var user = await _userManager.Users.SingleOrDefaultAsync(x => x.UserName == userName);

        if (user is null)
        {
            throw new UserNotFoundException();
        }

        var result = await _userManager.CheckPasswordAsync(user, password);

        if (!result)
        {
            throw new InvalidUserCredentialsException();
        }

        var roles = await _userManager.GetRolesAsync(user);

        return GenerateJwt(user, roles);
    }

    public async Task<Role> GetRoleAsync(Guid id)
    {
        var role = await _roleManager.Roles.SingleOrDefaultAsync(x => x.Id == id);

        if (role is null)
        {
            throw new RoleNotFoundException();
        }

        return role;
    }

    public async Task<Role> CreateRoleAsync(string roleName)
    {
        var role = new Role { Name = roleName };

        var result = await _roleManager.CreateAsync(role);

        if (!result.Succeeded)
        {
            throw new FailedToCreateRoleException(result.Errors.First().Description);
        }

        var created = _roleManager.Roles.SingleOrDefault(x => x.Name == roleName);

        if (created is null)
        {
            throw new FailedToCreateRoleException("Created role is not saved to database for some reason");
        }

        return created;
    }

    public async Task AssignRoleToUserAsync(string userName, string roleName)
    {
        var user = await _userManager.Users.SingleOrDefaultAsync(x => x.UserName == userName);

        if (user is null)
        {
            throw new UserNotFoundException();
        }

        if (await _roleManager.RoleExistsAsync(roleName) == false)
        {
            throw new RoleNotFoundException();
        }

        if (await _userManager.IsInRoleAsync(user, roleName))
        {
            return;
        }

        var result = await _userManager.AddToRoleAsync(user, roleName);

        if (!result.Succeeded)
        {
            throw new FailedToAssignRoleToUserException(result.Errors.First().Description);
        }
    }

    private string GenerateJwt(User user, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var roleClaims = roles.Select(x => new Claim(ClaimTypes.Role, x));
        claims.AddRange(roleClaims);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddDays(Convert.ToDouble(_jwtOptions.ExpirationInDays));

        var token = new JwtSecurityToken(
            _jwtOptions.Issuer,
            _jwtOptions.Issuer,
            claims,
            expires: expires,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}