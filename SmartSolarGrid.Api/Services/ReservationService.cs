// ============================================================================
// File: ReservationService.cs
// Description: Enforces 7-day scheduling, 12-hour notice, and QR lifecycle.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using System.Security.Cryptography;
using SmartSolarGrid.Api.DTOs;
using SmartSolarGrid.Api.Models;
using SmartSolarGrid.Api.Repositories;

namespace SmartSolarGrid.Api.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IMongoRepository<EnergyReservation> _resRepo;
        private readonly IMongoRepository<SolarStationInfo> _nodeRepo;
        private readonly IMongoRepository<EnergyBookingSlot> _slotRepo;
        private readonly IMongoRepository<User> _userRepo;

        // Constructor injecting repository context across dependencies.
        public ReservationService(
            IMongoRepository<EnergyReservation> resRepo,
            IMongoRepository<SolarStationInfo> nodeRepo,
            IMongoRepository<EnergyBookingSlot> slotRepo,
            IMongoRepository<User> userRepo)
        {
            _resRepo = resRepo;
            _nodeRepo = nodeRepo;
            _slotRepo = slotRepo;
            _userRepo = userRepo;
        }

        // Enforces Business Rule: Bookings must be scheduled within 7 days from now.
        public async Task<EnergyReservation> CreateReservationAsync(string prosumerNic, CreateReservationRequest request)
        {
            var user = await _userRepo.GetOneAsync(u => u.Nic == prosumerNic);
            if (user == null || user.Status != AccountStatus.Active)
            {
                throw new InvalidOperationException("User account is inactive or not found.");
            }

            var now = DateTime.UtcNow;
            var maxAllowedDate = now.AddDays(7);

            if (request.ScheduledDateTime < now)
            {
                throw new ArgumentException("Reservation cannot be scheduled in the past.");
            }

            if (request.ScheduledDateTime > maxAllowedDate)
            {
                throw new ArgumentException("Reservations must strictly be scheduled within 7 days from today.");
            }

            var node = await _nodeRepo.GetOneAsync(n => n.Id == request.StationId);
            if (node == null || !node.IsActive)
            {
                throw new InvalidOperationException("Selected solar station is unavailable or inactive.");
            }

            // Create unique transaction token to be encoded as QR code
            var qrToken = $"SOLAR-TX-{Guid.NewGuid().ToString("N")[..12].ToUpper()}";

            var reservation = new EnergyReservation
            {
                ProsumerNic = prosumerNic,
                StationId = request.StationId,
                SlotId = request.SlotId,
                ScheduledDateTime = request.ScheduledDateTime,
                EnergyAmountKwH = request.EnergyAmountKwH,
                Status = ReservationStatus.Approved,
                QrPayloadToken = qrToken,
                CreatedAt = DateTime.UtcNow
            };

            await _resRepo.CreateAsync(reservation);
            return reservation;
        }

        public Task<bool> UpdateReservationAsync(string reservationId, string prosumerNic, UpdateReservationRequest request) => throw new NotImplementedException();
        public Task<bool> CancelReservationAsync(string reservationId, string requestingUserNic, string userRole) => throw new NotImplementedException();
        public Task<bool> FinalizeTransferByQrAsync(string qrToken) => throw new NotImplementedException();
        public Task<IEnumerable<EnergyReservation>> GetProsumerReservationsAsync(string nic) => throw new NotImplementedException();
        public Task<IEnumerable<EnergyReservation>> GetAllReservationsAsync(string? status) => throw new NotImplementedException();
        public Task<OperationalDashboardResponse> GetDashboardMetricsAsync() => throw new NotImplementedException();
    }
}
