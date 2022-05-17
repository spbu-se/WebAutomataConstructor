using AC.Core.Exceptions;
using AC.Core.Models;
using AC.Data;

namespace AC.Services;

public sealed class UserService : IUserService
{
    private readonly DatabaseContext _database;

    public UserService(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<User> GetUserAsync(Guid id)
    {
        var user = await _database.Users.FindAsync(id);

        if (user is null)
        {
            throw new UserNotFoundException();
        }

        return user;
    }

    public async Task<User> UpdateUserAsync(User user, UserUpdate update)
    {
        user.About = update.About ?? user.About;

        await _database.SaveChangesAsync();

        return user;
    }
}