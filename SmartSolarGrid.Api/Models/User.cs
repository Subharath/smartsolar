// ============================================================================
// File: User.cs
// Description: User entity mapping with NIC primary key validation.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartSolarGrid.Api.Models
{
    public static class UserRoles
    {
        public const string Backoffice = "Backoffice";
        public const string GridOperator = "GridOperator";
        public const string Prosumer = "SolarProsumer";
    }

    public static class AccountStatus
    {
        public const string Active = "Active";
        public const string Inactive = "Inactive";
        public const string PendingDeactivation = "PendingDeactivation";
    }

    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Nic { get; set; } = string.Empty; // National Identity Card as primary key

        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [BsonElement("role")]
        public string Role { get; set; } = UserRoles.Prosumer;

        [BsonElement("status")]
        public string Status { get; set; } = AccountStatus.Active;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
