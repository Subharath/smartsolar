// ============================================================================
// File: MongoDbSettings.cs
// Description: Strongly typed configuration mapping for MongoDB settings.
// Module: SE4040 Enterprise Application Development
// ============================================================================

namespace SmartSolarGrid.Api.Models
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string UsersCollection { get; set; } = string.Empty;
        public string StationsCollection { get; set; } = string.Empty;
        public string SlotsCollection { get; set; } = string.Empty;
        public string ReservationsCollection { get; set; } = string.Empty;
    }
}
