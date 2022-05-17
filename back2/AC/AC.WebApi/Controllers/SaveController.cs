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
public sealed class SaveController : ControllerBase
{
    private readonly ISavesService _savesService;
    private readonly IUserService _userService;
    private readonly UserManager<User> _userManager;
    private readonly IMapper _mapper;

    public SaveController(
        ISavesService savesService,
        IUserService userService,
        UserManager<User> userManager,
        IMapper mapper)
    {
        _savesService = savesService;
        _userService = userService;
        _userManager = userManager;
        _mapper = mapper;
    }

    /// <summary>
    /// Returns user saves.
    /// </summary>
    /// <returns>List of user saves.</returns>
    /// <response code="200">List of user saves returned.</response>
    [HttpGet]
    [ProducesResponseType(typeof(List<SaveResponseResource>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSaves()
    {
        var user = await _userManager.GetUserAsync(HttpContext.User);

        var saves = await _savesService.GetSavesAsync(user);

        return Ok(_mapper.Map<List<SaveResponseResource>>(saves));
    }

    /// <summary>
    /// Returns list of user shared saves.
    /// </summary>
    /// <returns>List of user saves.</returns>
    /// <response code="200">List of user saves returned.</response>
    [HttpGet("user/{id:guid}")]
    [ProducesResponseType(typeof(List<SaveResponseResource>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserSaves(Guid id)
    {
        var saves = await _savesService.GetSavesAsync(id);

        return Ok(_mapper.Map<List<SaveResponseResource>>(saves));
    }

    /// <summary>
    /// Returns save by specified id.
    /// </summary>
    /// <param name="id">Id of save to return.</param>
    /// <returns>Found save.</returns>
    /// <response code="200">Save with specified id found and returned</response>
    /// <response code="404">Save with specified id not found</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SaveWithDataResponseResource), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ExceptionIntercepionResponseResource), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSave([FromRoute] Guid id)
    {
        var user = await _userManager.GetUserAsync(HttpContext.User);

        var save = await _savesService.GetSaveAsync(id, user);

        return Ok(_mapper.Map<SaveWithDataResponseResource>(save));
    }

    /// <summary>
    /// Creates new save.
    /// </summary>
    /// <param name="resource">Model of save to create.</param>
    /// <returns>Created save.</returns>
    /// <response code="201">Save created.</response>
    /// <response code="400">Save model is invalid.</response>
    [HttpPost]
    [ProducesResponseType(typeof(SaveWithDataResponseResource), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ExceptionIntercepionResponseResource), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateSave([FromBody] CreateSaveRequestResource resource)
    {
        var user = await _userManager.GetUserAsync(HttpContext.User);

        var save = _mapper.Map<Save>(resource);

        var created = await _savesService.CreateSaveAsync(save, user);

        return CreatedAtAction(nameof(GetSave), new { created.Id }, _mapper.Map<SaveWithDataResponseResource>(created));
    }

    /// <summary>
    /// Updates save with specified id with update model.
    /// </summary>
    /// <param name="id">Id of save to update.</param>
    /// <param name="resource">Update model.</param>
    /// <returns>Updated model.</returns>
    /// <response code="200">Save updated.</response>
    /// <response code="400">Save model is invalid.</response>
    /// <response code="404">Save with specified id not found.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SaveWithDataResponseResource), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ExceptionIntercepionResponseResource), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ExceptionIntercepionResponseResource), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSave([FromRoute] Guid id, [FromBody] UpdateSaveRequestResource resource)
    {
        var user = await _userManager.GetUserAsync(HttpContext.User);

        var update = _mapper.Map<SaveUpdate>(resource);

        var updated = await _savesService.UpdateSaveAsync(id, update, user);

        return Ok(_mapper.Map<SaveWithDataResponseResource>(updated));
    }

    /// <summary>
    /// Clones shared save.
    /// </summary>
    /// <returns>Cloned save.</returns>
    /// <response code="200">Save with specified id find, cloned and returned.</response>
    /// <response code="404">Shared save with specified id not found.</response>
    [ProducesResponseType(typeof(SaveWithDataResponseResource), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ExceptionIntercepionResponseResource), StatusCodes.Status404NotFound)]
    [HttpPost("clone/{id:guid}")]
    public async Task<IActionResult> CloneSave(Guid id)
    {
        var user = await _userManager.GetUserAsync(HttpContext.User);

        var cloned = await _savesService.CloneSaveAsync(id, user);

        return Ok(_mapper.Map<SaveWithDataResponseResource>(cloned));
    }

    /// <summary>
    /// Removes save.
    /// </summary>
    /// <param name="id">Id of save to remove.</param>
    /// <response code="204">Save removed.</response>
    /// <response code="404">Save with specified id not found.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveSave([FromRoute] Guid id)
    {
        var user = await _userManager.GetUserAsync(HttpContext.User);

        await _savesService.RemoveSaveAsync(id, user);

        return NoContent();
    }
}