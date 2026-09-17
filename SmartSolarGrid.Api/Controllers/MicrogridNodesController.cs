// ============================================================================
// File: MicrogridNodesController.cs
// Description: HTTP endpoints managing solar hubs and slot capacity.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSolarGrid.Api.DTOs;
using SmartSolarGrid.Api.Models;
using SmartSolarGrid.Api.Services;

namespace SmartSolarGrid.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MicrogridNodesController : ControllerBase
    {
        private readonly INodeService _nodeService;

        // Constructor injecting microgrid node business operations.
        public MicrogridNodesController(INodeService nodeService)
        {
            _nodeService = nodeService;
        }

        // Public/Prosumer endpoint: Retrieves active nodes for map plotting.
        [HttpGet]
        public async Task<IActionResult> GetAllNodes()
        {
            var nodes = await _nodeService.GetAllActiveNodesAsync();
            return Ok(nodes);
        }

        // Reads a specific node's details.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNodeById(string id)
        {
            var node = await _nodeService.GetNodeByIdAsync(id);
            return node == null ? NotFound() : Ok(node);
        }

        // Backoffice/Operator: Creates a new microgrid hub.
        [Authorize(Roles = $"{UserRoles.Backoffice},{UserRoles.GridOperator}")]
        [HttpPost]
        public async Task<IActionResult> CreateNode([FromBody] CreateNodeRequest request)
        {
            var node = await _nodeService.CreateNodeAsync(request);
            return CreatedAtAction(nameof(GetNodeById), new { id = node.Id }, node);
        }

        // Backoffice/Operator: Updates hub specs and battery slot count.
        [Authorize(Roles = $"{UserRoles.Backoffice},{UserRoles.GridOperator}")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNode(string id, [FromBody] UpdateNodeRequest request)
        {
            var updated = await _nodeService.UpdateNodeAsync(id, request);
            return updated ? Ok(new { message = "Node updated successfully." }) : NotFound();
        }

        // Backoffice only: Deactivates a node if no active reservations exist.
        [Authorize(Roles = UserRoles.Backoffice)]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeactivateNode(string id)
        {
            try
            {
                var success = await _nodeService.DeactivateNodeAsync(id);
                return success ? Ok(new { message = "Station deactivated successfully." }) : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // Backoffice/Operator: Defines an operational charging/drop-off slot.
        [Authorize(Roles = $"{UserRoles.Backoffice},{UserRoles.GridOperator}")]
        [HttpPost("slots")]
        public async Task<IActionResult> CreateSlot([FromBody] CreateSlotRequest request)
        {
            var slot = await _nodeService.CreateSlotAsync(request);
            return Ok(slot);
        }

        // Retrieves scheduled slots for a given node.
        [HttpGet("{id}/slots")]
        public async Task<IActionResult> GetSlots(string id)
        {
            var slots = await _nodeService.GetSlotsByNodeAsync(id);
            return Ok(slots);
        }
    }
}
