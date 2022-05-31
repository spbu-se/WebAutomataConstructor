using System.Security.Claims;
using AC.Core.Constants;
using AC.Core.Exceptions;
using AC.Core.Models;
using AC.Core.Options;
using AC.Services;
using AC.WebApi.Resources.Requests;
using AC.WebApi.Resources.Responses;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AC.WebApi.Controllers;

[ApiController]
[Route("[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly SignInManager<User> _signInManager;
    private readonly AuthRedirectsOptions _redirectOptions;
    private readonly IMapper _mapper;

    public AuthController(
        IAuthService authService,
        SignInManager<User> signInManager,
        IOptions<AuthRedirectsOptions> redirectOptions,
        IMapper mapper)
    {
        _authService = authService;
        _signInManager = signInManager;
        _redirectOptions = redirectOptions.Value;
        _mapper = mapper;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] UserSignUpRequestResource resource)
    {
        var user = _mapper.Map<User>(resource);

        var created = await _authService.CreateUserAsync(user, resource.Password);

        return CreatedAtAction(nameof(UserController.GetUser), "User", null,
            _mapper.Map<CurrentUserResponseResource>(created));
    }

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] UserSignInRequestResource resource)
    {
        var jwt = await _authService.LoginUserAsync(resource.Email, resource.Password);

        return Ok(jwt);
    }

    [HttpGet("external/providers")]
    public async Task<IActionResult> GetExternalSignInProviders()
    {
        var providers = (await _signInManager.GetExternalAuthenticationSchemesAsync()).Select(x => x.Name);

        return Ok(providers);
    }

    [HttpGet("external/signin")]
    public async Task<IActionResult> ExternalSignIn([FromQuery] string provider)
    {
        var providers = (await _signInManager.GetExternalAuthenticationSchemesAsync()).Select(x => x.Name);

        if (!providers.Contains(provider))
        {
            throw new ExternalSignInProviderNotFoundException();
        }

        var redirectUrl = Url.Action(nameof(ExternalSignInCallback));
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);

        return new ChallengeResult(provider, properties);
    }

    [HttpGet("external/signin-callback")]
    public async Task<IActionResult> ExternalSignInCallback()
    {
        var info = await _signInManager.GetExternalLoginInfoAsync();

        var jwt = await _authService.LoginExternalUserAsync(
            info.Principal.FindFirstValue(ClaimTypes.Email),
            info.LoginProvider
        );

        return Redirect($"{_redirectOptions.SuccessRedirectUrl}?jwt={jwt}");
    }

    [Authorize(Roles = RoleName.Admin)]
    [HttpGet("role/{id:guid}")]
    public async Task<IActionResult> GetRole([FromRoute] Guid id)
    {
        var role = await _authService.GetRoleAsync(id);

        return Ok(_mapper.Map<RoleResponseResource>(role));
    }

    [Authorize(Roles = RoleName.Admin)]
    [HttpPost("role")]
    public async Task<IActionResult> CreateRole([FromQuery] string roleName)
    {
        var created = await _authService.CreateRoleAsync(roleName);

        return CreatedAtAction(nameof(GetRole), new { created.Id }, _mapper.Map<RoleResponseResource>(created));
    }

    [Authorize(Roles = RoleName.Admin)]
    [HttpPost("role/assign")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleToUserRequestResource resource)
    {
        await _authService.AssignRoleToUserAsync(resource.UserEmail, resource.RoleName);

        return Ok();
    }
}