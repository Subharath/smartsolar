// ============================================================================
// File: AuthService.cs
// Description: Centralized account business logic and token management.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.IdentityModel.Tokens;
using SmartSolarGrid.Api.DTOs;
using SmartSolarGrid.Api.Models;
using SmartSolarGrid.Api.Repositories;

namespace SmartSolarGrid.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IMongoRepository<User> _userRepo;
        private readonly IConfiguration _config;

        // Injects repository dependencies and configuration providers.
        public AuthService(IMongoRepository<User> userRepo, IConfiguration config)
        {
            _userRepo = userRepo;
            _config = config;
        }

        // Registers a new user enforcing unique Sri Lankan NIC format validation.
        public async Task<AuthResponse> RegisterAsync(RegisterUserRequest request)
        {
            var formattedNic = request.Nic.Trim().ToUpper();

            // Sri Lankan NIC check: Old (9 digits + V/X) or New (12 digits)
            var nicPattern = @"^([0-9]{9}[VvXx]|[0-9]{12})$";
            if (!Regex.IsMatch(formattedNic, nicPattern))
            {
                throw new ArgumentException("Invalid Sri Lankan NIC format. Must be 9 digits with V/X or 12 digits.");
            }

            var existing = await _userRepo.GetOneAsync(u => u.Nic == formattedNic);
            if (existing != null)
            {
                throw new InvalidOperationException("A user with this NIC already exists in the system.");
            }

            var user = new User
            {
                Nic = formattedNic,
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = string.IsNullOrWhiteSpace(request.Role) ? UserRoles.Prosumer : request.Role,
                Status = AccountStatus.Active
            };

            await _userRepo.CreateAsync(user);
            var token = GenerateToken(user);

            return new AuthResponse(token, user.Nic, user.FullName, user.Role, user.Status);
        }

        // Authenticates credentials and validates active account status.
        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var formattedIdentifier = request.Nic.Trim();
            var user = await _userRepo.GetOneAsync(u =>
                u.Nic.ToUpper() == formattedIdentifier.ToUpper() ||
                u.Email.ToLower() == formattedIdentifier.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid credentials provided.");
            }

            if (user.Status == AccountStatus.Inactive)
            {
                throw new InvalidOperationException("Account is deactivated. Contact a Backoffice officer to reactivate.");
            }

            var token = GenerateToken(user);
            return new AuthResponse(token, user.Nic, user.FullName, user.Role, user.Status);
        }

        // Reads profile data matching the target NIC.
        public async Task<UserProfileResponse?> GetProfileAsync(string nic)
        {
            var user = await _userRepo.GetOneAsync(u => u.Nic == nic);
            if (user == null) return null;

            return new UserProfileResponse(user.Nic, user.FullName, user.Email, user.Role, user.Status);
        }

        // Modifies existing profile attributes.
        public async Task<bool> UpdateProfileAsync(string nic, UpdateUserRequest request)
        {
            var user = await _userRepo.GetOneAsync(u => u.Nic == nic);
            if (user == null) return false;

            user.FullName = request.FullName;
            user.Email = request.Email;

            return await _userRepo.UpdateAsync(u => u.Nic == nic, user);
        }

        // Allows prosumer to set account state to deactivated.
        public async Task<bool> RequestDeactivationAsync(string nic)
        {
            var user = await _userRepo.GetOneAsync(u => u.Nic == nic);
            if (user == null) return false;

            user.Status = AccountStatus.Inactive;
            return await _userRepo.UpdateAsync(u => u.Nic == nic, user);
        }

        // Reactivates an account (Strict Backoffice authority).
        public async Task<bool> ReactivateAccountAsync(string nic)
        {
            var user = await _userRepo.GetOneAsync(u => u.Nic == nic);
            if (user == null) return false;

            user.Status = AccountStatus.Active;
            return await _userRepo.UpdateAsync(u => u.Nic == nic, user);
        }

        // Returns all deactivated prosumers awaiting reactivation in web view.
        public async Task<IEnumerable<UserProfileResponse>> GetPendingActivationsAsync()
        {
            var users = await _userRepo.FindAsync(u => u.Status == AccountStatus.Inactive);
            return users.Select(u => new UserProfileResponse(u.Nic, u.FullName, u.Email, u.Role, u.Status));
        }

        // Backoffice function: Retrieves all registered system users with optional role filtering.
        public async Task<IEnumerable<UserProfileResponse>> GetAllUsersAsync(string? role = null)
        {
            IEnumerable<User> users;
            if (!string.IsNullOrWhiteSpace(role))
            {
                users = await _userRepo.FindAsync(u => u.Role.ToLower() == role.ToLower());
            }
            else
            {
                users = await _userRepo.GetAllAsync();
            }
            return users.Select(u => new UserProfileResponse(u.Nic, u.FullName, u.Email, u.Role, u.Status));
        }

        // Backoffice function: Directly updates profile information, role, or status for any user.
        public async Task<bool> AdminUpdateUserAsync(string nic, UpdateUserRequest request, string? role = null, string? status = null)
        {
            var user = await _userRepo.GetOneAsync(u => u.Nic == nic);
            if (user == null) return false;

            user.FullName = request.FullName;
            user.Email = request.Email;

            if (!string.IsNullOrWhiteSpace(role)) user.Role = role;
            if (!string.IsNullOrWhiteSpace(status)) user.Status = status;

            return await _userRepo.UpdateAsync(u => u.Nic == nic, user);
        }

        // Signs a standard cryptographic JWT bearer token for client sessions.
        private string GenerateToken(User user)
        {
            var keyBytes = Encoding.UTF8.GetBytes(_config["JwtSettings:Secret"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Nic),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _config["JwtSettings:Issuer"],
                Audience = _config["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
