using AC.Core.Constants;
using AC.Core.Models;
using AC.Services;
using AC.WebApi.Resources.Requests;
using AC.WebApi.Resources.Responses;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AC.WebApi.Controllers;

[Authorize(Roles = RoleName.User)]
[ApiController]
[Route("[controller]")]
public sealed class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;

    public UserController(IUserService userService, UserManager<User> userManager, IMapper mapper)
    {
        _userService = userService;
        _userManager = userManager;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns current authorized user.
    /// </summary>
    /// <returns>User model.</returns>
    /// <response code="200">User returned</response>
    [HttpGet]
    [ProducesResponseType(typeof(UserResponseResource), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUser()
    {
        var user = await _userManager.GetUserAsync(HttpContext.User);

        return Ok(_mapper.Map<UserResponseResource>(user));
    }

    /// <summary>
    /// Updated current authorized user.
    /// </summary>
    /// <param name="resource">Update user model.</param>
    /// <returns>Updated user.</returns>
    /// <response code="200">User updated.</response>
    /// <response code="400">Update user model is invalid.</response>
    [HttpPut]
    [ProducesResponseType(typeof(UserResponseResource), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ExceptionIntercepionResponseResource), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateUser(UpdateUserRequestResource resource)
    {
        var user = await _userManager.GetUserAsync(HttpContext.User);

        var update = _mapper.Map<UserUpdate>(resource);

        var updated = await _userService.UpdateUserAsync(user, update);

        return Ok(_mapper.Map<UserResponseResource>(updated));
    }
}