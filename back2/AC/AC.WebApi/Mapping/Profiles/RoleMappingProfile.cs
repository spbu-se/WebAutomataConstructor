using AC.Core.Models;
using AC.WebApi.Resources.Responses;
using AutoMapper;

namespace AC.WebApi.Mapping.Profiles;

public sealed class RoleMappingProfile : Profile
{
    public RoleMappingProfile()
    {
        CreateMap<Role, RoleResponseResource>();
    }
}