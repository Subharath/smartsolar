// ============================================================================
// File: MicrogridNodeDTOs.cs
// Description: Data contracts for node management and slot scheduling.
// Module: SE4040 Enterprise Application Development
// ============================================================================

namespace SmartSolarGrid.Api.DTOs
{
    public record CreateNodeRequest(string StationCode, string HubName, double Latitude, double Longitude, double CapacityKwH, int TotalBatterySlots, string OperationalSchedule);
    public record UpdateNodeRequest(string HubName, double Latitude, double Longitude, double CapacityKwH, int AvailableBatterySlots, string OperationalSchedule);
    public record CreateSlotRequest(string StationId, DateTime StartTime, DateTime EndTime, double MaxSlotCapacityKwH);
    public record UpdateSlotRequest(DateTime StartTime, DateTime EndTime, double MaxSlotCapacityKwH, bool IsAvailable);
}
