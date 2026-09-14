// ============================================================================
// File: NodeService.cs
// Description: Microgrid node logic enforcing slot and deactivation constraints.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using SmartSolarGrid.Api.DTOs;
using SmartSolarGrid.Api.Models;
using SmartSolarGrid.Api.Repositories;

namespace SmartSolarGrid.Api.Services
{
    public class NodeService : INodeService
    {
        private readonly IMongoRepository<SolarStationInfo> _nodeRepo;
        private readonly IMongoRepository<EnergyBookingSlot> _slotRepo;
        private readonly IMongoRepository<EnergyReservation> _resRepo;

        // Constructor injecting station, slot, and reservation data sources.
        public NodeService(
            IMongoRepository<SolarStationInfo> nodeRepo,
            IMongoRepository<EnergyBookingSlot> slotRepo,
            IMongoRepository<EnergyReservation> resRepo)
        {
            _nodeRepo = nodeRepo;
            _slotRepo = slotRepo;
            _resRepo = resRepo;
        }

        // Fetches all active microgrid hubs for map displays.
        public async Task<IEnumerable<SolarStationInfo>> GetAllActiveNodesAsync()
        {
            return await _nodeRepo.FindAsync(n => n.IsActive);
        }

        // Retrieves details for a specific node by its unique identifier.
        public async Task<SolarStationInfo?> GetNodeByIdAsync(string id)
        {
            return await _nodeRepo.GetOneAsync(n => n.Id == id);
        }

        // Registers a new microgrid hub with location and battery specs.
        public async Task<SolarStationInfo> CreateNodeAsync(CreateNodeRequest request)
        {
            var node = new SolarStationInfo
            {
                StationCode = request.StationCode,
                HubName = request.HubName,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                CapacityKwH = request.CapacityKwH,
                TotalBatterySlots = request.TotalBatterySlots,
                AvailableBatterySlots = request.TotalBatterySlots,
                OperationalSchedule = request.OperationalSchedule,
                IsActive = true
            };

            await _nodeRepo.CreateAsync(node);
            return node;
        }

        // Updates operational capacity and battery slot assignments.
        public async Task<bool> UpdateNodeAsync(string id, UpdateNodeRequest request)
        {
            var node = await _nodeRepo.GetOneAsync(n => n.Id == id);
            if (node == null) return false;

            node.HubName = request.HubName;
            node.Latitude = request.Latitude;
            node.Longitude = request.Longitude;
            node.CapacityKwH = request.CapacityKwH;
            node.AvailableBatterySlots = request.AvailableBatterySlots;
            node.OperationalSchedule = request.OperationalSchedule;

            return await _nodeRepo.UpdateAsync(n => n.Id == id, node);
        }

        public Task<bool> DeactivateNodeAsync(string id) => throw new NotImplementedException();
        public Task<EnergyBookingSlot> CreateSlotAsync(CreateSlotRequest request) => throw new NotImplementedException();
        public Task<IEnumerable<EnergyBookingSlot>> GetSlotsByNodeAsync(string stationId) => throw new NotImplementedException();
    }
}
