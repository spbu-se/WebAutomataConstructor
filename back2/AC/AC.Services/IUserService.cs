using AC.Core.Models;

namespace AC.Services;

public interface IUserService
{
    Task<User> GetUserAsync(Guid id);
    
    Task<User> UpdateUserAsync(User user, UserUpdate update);
}