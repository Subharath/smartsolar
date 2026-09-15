// ============================================================================
// File: IReservationService.cs
// Description: Reservation service contract enforcing trading rules.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using SmartSolarGrid.Api.DTOs;
using SmartSolarGrid.Api.Models;

namespace SmartSolarGrid.Api.Services
{
    public interface IReservationService
    {
        Task<EnergyReservation> CreateReservationAsync(string prosumerNic, CreateReservationRequest request);
        Task<bool> UpdateReservationAsync(string reservationId, string prosumerNic, UpdateReservationRequest request);
        Task<bool> CancelReservationAsync(string reservationId, string requestingUserNic, string userRole);
        Task<bool> FinalizeTransferByQrAsync(string qrToken);
        Task<IEnumerable<EnergyReservation>> GetProsumerReservationsAsync(string nic);
        Task<IEnumerable<EnergyReservation>> GetAllReservationsAsync(string? status);
        Task<OperationalDashboardResponse> GetDashboardMetricsAsync();
    }
}
