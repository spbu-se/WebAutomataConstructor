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
            .OrderBy(x => x.CreatedDateTime)
            .ToListAsync();

        return saves;
    }

    public async Task<List<Save>> GetSavesAsync(Guid ownerUserId)
    {
        var saves = await _database.Saves
            .Where(x => x.UserId == ownerUserId && x.IsShared && !x.IsRemoved)
            .OrderBy(x => x.CreatedDateTime)
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

    public async Task<Save> GetSharedSaveAsync(Guid id)
    {
        var save = await _database.Saves.FindAsync(id);

        if (save is null || !save.IsShared || save.IsRemoved)
        {
            throw new SaveNotFoundException();
        }

        return save;
    }

    public async Task<Save> CreateSaveAsync(Save save, User user)
    {
        var saveWithSameName = await _database.Saves.SingleOrDefaultAsync(x => x.Name == save.Name &&
                                                                               x.UserId == user.Id &&
                                                                               !x.IsRemoved);

        if (saveWithSameName is not null)
        {
            var update = new SaveUpdate { Data = save.Data };

            return await UpdateSaveAsync(saveWithSameName.Id, update, user);
        }

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
        save.IsShared = update.IsShared ?? save.IsShared;

        if (update.Data is not null)
        {
            save.LastModifiedDateTime = DateTime.UtcNow;
        }

        await _database.SaveChangesAsync();

        return save;
    }

    public async Task<Save> CloneSaveAsync(Guid originalSaveId, User user)
    {
        var originalSave = await GetSharedSaveAsync(originalSaveId);

        var save = new Save
        {
            Name = originalSave.Name,
            Data = originalSave.Data,
            UserId = user.Id
        };

        await _database.Saves.AddAsync(save);

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