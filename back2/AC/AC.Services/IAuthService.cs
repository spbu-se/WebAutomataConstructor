using AC.Core.Models;

namespace AC.Services;

public interface IAuthService
{
    Task<User> CreateUserAsync(User user, string password);

    Task<string> LoginExternalUserAsync(string email, string provider);

    Task<string> LoginUserAsync(string userName, string password);

    Task<Role> GetRoleAsync(Guid id);
    
    Task<Role> CreateRoleAsync(string roleName);
    
    Task AssignRoleToUserAsync(string userName, string roleName);
}