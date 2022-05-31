using AC.Core.Models;

namespace AC.Services;

public interface ISavesService
{
    Task<List<Save>> GetSavesAsync(User user);

    Task<List<Save>> GetSavesAsync(Guid ownerUserId);

    Task<Save> GetSaveAsync(Guid id, User user);

    Task<Save> GetSharedSaveAsync(Guid id);

    Task<Save> CreateSaveAsync(Save save, User user);

    Task<Save> UpdateSaveAsync(Guid id, SaveUpdate update, User user);

    Task<Save> CloneSaveAsync(Guid originalSaveId, User user);

    Task RemoveSaveAsync(Guid id, User user);
}