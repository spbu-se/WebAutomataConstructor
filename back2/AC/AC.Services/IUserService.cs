using AC.Core.Models;

namespace AC.Services;

public interface IUserService
{
    Task<User> UpdateUserAsync(User user, UserUpdate update);
}