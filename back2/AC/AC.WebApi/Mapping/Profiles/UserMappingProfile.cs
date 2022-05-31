using AC.Core.Models;
using AC.WebApi.Resources.Requests;
using AC.WebApi.Resources.Responses;
using AutoMapper;

namespace AC.WebApi.Mapping.Profiles;

public sealed class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        CreateMap<UserSignUpRequestResource, User>()
            .ForMember(x => x.UserName, x => x.MapFrom(y => y.Email));
        CreateMap<UpdateUserRequestResource, UserUpdate>();

        CreateMap<User, UserResponseResource>();
        CreateMap<User, CurrentUserResponseResource>();
    }
}