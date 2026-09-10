// ============================================================================
// File: EnergyReservation.cs
// Description: Reservation entity tracking solar energy transactions and QR.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartSolarGrid.Api.Models
{
    public static class ReservationStatus
    {
        public const string Pending = "Pending";
        public const string Approved = "Approved";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";
    }

    public class EnergyReservation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("prosumerNic")]
        public string ProsumerNic { get; set; } = string.Empty;

        [BsonElement("stationId")]
        public string StationId { get; set; } = string.Empty;

        [BsonElement("slotId")]
        public string SlotId { get; set; } = string.Empty;

        [BsonElement("scheduledDateTime")]
        public DateTime ScheduledDateTime { get; set; }

        [BsonElement("energyAmountKwH")]
        public double EnergyAmountKwH { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = ReservationStatus.Pending;

        [BsonElement("qrPayloadToken")]
        public string QrPayloadToken { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("completedAt")]
        public DateTime? CompletedAt { get; set; }
    }
}
