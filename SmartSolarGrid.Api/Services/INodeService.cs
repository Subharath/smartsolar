// ============================================================================
// File: INodeService.cs
// Description: Microgrid node and slot scheduling business interface.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using SmartSolarGrid.Api.DTOs;
using SmartSolarGrid.Api.Models;

namespace SmartSolarGrid.Api.Services
{
    public interface INodeService
    {
        Task<IEnumerable<SolarStationInfo>> GetAllActiveNodesAsync();
        Task<SolarStationInfo?> GetNodeByIdAsync(string id);
        Task<SolarStationInfo> CreateNodeAsync(CreateNodeRequest request);
        Task<bool> UpdateNodeAsync(string id, UpdateNodeRequest request);
        Task<bool> DeactivateNodeAsync(string id); // Enforces reservation check
        Task<EnergyBookingSlot> CreateSlotAsync(CreateSlotRequest request);
        Task<IEnumerable<EnergyBookingSlot>> GetSlotsByNodeAsync(string stationId);
    }
}
