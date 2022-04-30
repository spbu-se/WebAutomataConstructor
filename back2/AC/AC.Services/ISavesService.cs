using AC.Core.Models;

namespace AC.Services;

public interface ISavesService
{
    Task<List<Save>> GetSavesAsync(User user);
    
    Task<Save> GetSaveAsync(Guid id, User user);

    Task<Save> CreateSaveAsync(Save save, User user);

    Task<Save> UpdateSaveAsync(Guid id, SaveUpdate update, User user);

    Task RemoveSaveAsync(Guid id, User user);
}