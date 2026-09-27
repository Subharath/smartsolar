// ============================================================================
// File: ReservationDTOs.cs
// Description: Data contracts for energy reservation transactions.
// Module: SE4040 Enterprise Application Development
// ============================================================================

namespace SmartSolarGrid.Api.DTOs
{
    public record CreateReservationRequest(string StationId, string SlotId, DateTime ScheduledDateTime, double EnergyAmountKwH, string? ProsumerNic = null);
    public record UpdateReservationRequest(DateTime NewScheduledDateTime, double NewEnergyAmountKwH);
    public record FinalizeTransferRequest(string QrToken);
    public record OperationalDashboardResponse(int PendingReservations, int ApprovedFutureReservations, int TotalActiveNodes);
}
