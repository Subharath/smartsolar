// ============================================================================
// File: AuthDTOs.cs
// Description: Request and response contract schemas for authentication.
// Module: SE4040 Enterprise Application Development
// ============================================================================

namespace SmartSolarGrid.Api.DTOs
{
    public record RegisterUserRequest(string Nic, string FullName, string Email, string Password, string Role);
    public record LoginRequest(string Nic, string Password);
    public record AuthResponse(string Token, string Nic, string FullName, string Role, string Status);
    public record UserProfileResponse(string Nic, string FullName, string Email, string Role, string Status);
    public record UpdateUserRequest(string FullName, string Email);
}
