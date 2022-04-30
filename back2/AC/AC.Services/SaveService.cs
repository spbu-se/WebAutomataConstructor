using AC.Core.Exceptions;
using AC.Core.Models;
using AC.Data;
using Microsoft.EntityFrameworkCore;

namespace AC.Services;

public sealed class SaveService : ISavesService
{
    private readonly DatabaseContext _database;

    public SaveService(DatabaseContext database)
    {
        _database = database;
    }

    public async Task<List<Save>> GetSavesAsync(User user)
    {
        var saves = await _database.Saves
            .Where(x => x.UserId == user.Id && x.IsRemoved == false)
            .ToListAsync();

        return saves;
    }

    public async Task<Save> GetSaveAsync(Guid id, User user)
    {
        var save = await _database.Saves.FindAsync(id);

        if (save is null || save.UserId != user.Id || save.IsRemoved)
        {
            throw new SaveNotFoundException();
        }

        return save;
    }

    public async Task<Save> CreateSaveAsync(Save save, User user)
    {
        save.UserId = user.Id;

        await _database.Saves.AddAsync(save);

        await _database.SaveChangesAsync();

        return save;
    }

    public async Task<Save> UpdateSaveAsync(Guid id, SaveUpdate update, User user)
    {
        var save = await GetSaveAsync(id, user);

        save.Name = update.Name ?? save.Name;
        save.Data = update.Data ?? save.Data;

        if (update.Data is not null)
        {
            save.LastModifiedDateTime = DateTime.UtcNow;
        }

        await _database.SaveChangesAsync();

        return save;
    }

    public async Task RemoveSaveAsync(Guid id, User user)
    {
        var save = await GetSaveAsync(id, user);

        save.IsRemoved = true;

        await _database.SaveChangesAsync();
    }
}