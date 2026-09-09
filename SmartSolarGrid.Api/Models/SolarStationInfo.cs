// ============================================================================
// File: SolarStationInfo.cs
// Description: Microgrid Node hub entity tracking capacity and slots.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartSolarGrid.Api.Models
{
    public class SolarStationInfo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("stationCode")]
        public string StationCode { get; set; } = string.Empty;

        [BsonElement("hubName")]
        public string HubName { get; set; } = string.Empty;

        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }

        [BsonElement("capacityKwH")]
        public double CapacityKwH { get; set; }

        [BsonElement("totalBatterySlots")]
        public int TotalBatterySlots { get; set; }

        [BsonElement("availableBatterySlots")]
        public int AvailableBatterySlots { get; set; }

        [BsonElement("operationalSchedule")]
        public string OperationalSchedule { get; set; } = "08:00-18:00";

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;
    }
}
