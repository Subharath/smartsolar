// ============================================================================
// File: IAuthService.cs
// Description: Authentication and account maintenance contract.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using SmartSolarGrid.Api.DTOs;
using SmartSolarGrid.Api.Models;

namespace SmartSolarGrid.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterUserRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserProfileResponse?> GetProfileAsync(string nic);
        Task<bool> UpdateProfileAsync(string nic, UpdateUserRequest request);
        Task<bool> RequestDeactivationAsync(string nic);
        Task<bool> ReactivateAccountAsync(string nic);
        Task<IEnumerable<UserProfileResponse>> GetPendingActivationsAsync();
        Task<IEnumerable<UserProfileResponse>> GetAllUsersAsync(string? role = null);
        Task<bool> AdminUpdateUserAsync(string nic, UpdateUserRequest request, string? role = null, string? status = null);
    }
}
