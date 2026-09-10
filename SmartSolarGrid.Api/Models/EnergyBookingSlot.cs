// ============================================================================
// File: EnergyBookingSlot.cs
// Description: Schedule time window definitions for solar trading nodes.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartSolarGrid.Api.Models
{
    public class EnergyBookingSlot
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("stationId")]
        public string StationId { get; set; } = string.Empty;

        [BsonElement("startTime")]
        public DateTime StartTime { get; set; }

        [BsonElement("endTime")]
        public DateTime EndTime { get; set; }

        [BsonElement("maxSlotCapacityKwH")]
        public double MaxSlotCapacityKwH { get; set; }

        [BsonElement("isAvailable")]
        public bool IsAvailable { get; set; } = true;
    }
}
