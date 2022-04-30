using AC.Core.Models;
using AC.WebApi.Resources.Requests;
using AC.WebApi.Resources.Responses;
using AutoMapper;

namespace AC.WebApi.Mapping.Profiles;

public sealed class SaveMappingProfile : Profile
{
    public SaveMappingProfile()
    {
        CreateMap<CreateSaveRequestResource, Save>();
        CreateMap<UpdateSaveRequestResource, SaveUpdate>();

        CreateMap<Save, SaveResponseResource>();
        CreateMap<Save, SaveWithDataResponseResource>();
    }
}