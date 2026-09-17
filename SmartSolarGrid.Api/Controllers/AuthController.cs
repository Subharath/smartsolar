// ============================================================================
// File: AuthController.cs
// Description: HTTP interface for authentication, registration, and status.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSolarGrid.Api.DTOs;
using SmartSolarGrid.Api.Models;
using SmartSolarGrid.Api.Services;

namespace SmartSolarGrid.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        // Constructor injecting authentication service logic.
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // Registers a new user account into the system.
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                return Ok(response);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }

        // Authenticates credentials and returns a signed JWT token.
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return StatusCode(403, new { message = ex.Message }); }
        }

        // Fetches profile details for the currently authenticated user.
        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userNic = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userNic)) return Unauthorized();

            var profile = await _authService.GetProfileAsync(userNic);
            return profile == null ? NotFound() : Ok(profile);
        }

        // Updates user profile information.
        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserRequest request)
        {
            var userNic = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userNic)) return Unauthorized();

            var updated = await _authService.UpdateProfileAsync(userNic, request);
            return updated ? Ok(new { message = "Profile updated successfully." }) : BadRequest();
        }

        // Allows a prosumer to deactivate their account.
        [Authorize]
        [HttpPost("deactivate-request")]
        public async Task<IActionResult> DeactivateSelf()
        {
            var userNic = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userNic)) return Unauthorized();

            var result = await _authService.RequestDeactivationAsync(userNic);
            return result ? Ok(new { message = "Account successfully deactivated." }) : BadRequest();
        }

        // Backoffice only: Reactivates a deactivated prosumer account.
        [Authorize(Roles = UserRoles.Backoffice)]
        [HttpPost("reactivate/{nic}")]
        public async Task<IActionResult> ReactivateAccount(string nic)
        {
            var result = await _authService.ReactivateAccountAsync(nic);
            return result ? Ok(new { message = "Account reactivated by Backoffice officer." }) : NotFound();
        }

        // Backoffice only: Lists all inactive/deactivated users.
        [Authorize(Roles = UserRoles.Backoffice)]
        [HttpGet("pending-activations")]
        public async Task<IActionResult> GetPendingActivations()
        {
            var list = await _authService.GetPendingActivationsAsync();
            return Ok(list);
        }
    }
}
