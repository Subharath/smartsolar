// ============================================================================
// File: ReservationsController.cs
// Description: HTTP endpoints for reservation management, rules, and QR checks.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSolarGrid.Api.DTOs;
using SmartSolarGrid.Api.Models;
using SmartSolarGrid.Api.Services;

namespace SmartSolarGrid.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _resService;

        // Constructor injecting reservation business service.
        public ReservationsController(IReservationService resService)
        {
            _resService = resService;
        }

        // Prosumer: Creates an energy slot reservation (enforcing 7-day rule).
        [Authorize(Roles = UserRoles.Prosumer)]
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
        {
            var userNic = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userNic)) return Unauthorized();

            try
            {
                var reservation = await _resService.CreateReservationAsync(userNic, request);
                return CreatedAtAction(nameof(GetMyReservations), new { id = reservation.Id }, reservation);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }

        // Prosumer: Modifies existing reservation (enforcing 12-hour rule).
        [Authorize(Roles = UserRoles.Prosumer)]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(string id, [FromBody] UpdateReservationRequest request)
        {
            var userNic = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userNic)) return Unauthorized();

            try
            {
                var updated = await _resService.UpdateReservationAsync(id, userNic, request);
                return updated ? Ok(new { message = "Reservation updated successfully." }) : NotFound();
            }
            catch (InvalidOperationException ex) { return StatusCode(400, new { message = ex.Message }); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // Prosumer or Operator: Cancels a reservation (enforcing 12-hour rule for prosumers).
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelReservation(string id)
        {
            var userNic = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var userRole = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

            try
            {
                var result = await _resService.CancelReservationAsync(id, userNic, userRole);
                return result ? Ok(new { message = "Reservation cancelled successfully." }) : NotFound();
            }
            catch (InvalidOperationException ex) { return StatusCode(400, new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        // Grid Operator: Scans QR code and finalizes energy transfer.
        [Authorize(Roles = UserRoles.GridOperator)]
        [HttpPost("finalize-transfer")]
        public async Task<IActionResult> FinalizeTransfer([FromBody] FinalizeTransferRequest request)
        {
            try
            {
                var success = await _resService.FinalizeTransferByQrAsync(request.QrToken);
                return success ? Ok(new { message = "Energy transfer verified and marked completed." }) : BadRequest();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }

        // Prosumer: Reads their own booking history.
        [Authorize(Roles = UserRoles.Prosumer)]
        [HttpGet("my-history")]
        public async Task<IActionResult> GetMyReservations()
        {
            var userNic = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userNic)) return Unauthorized();

            var reservations = await _resService.GetProsumerReservationsAsync(userNic);
            return Ok(reservations);
        }

        // Grid Operator / Backoffice: Reads all bookings with optional query filter.
        [Authorize(Roles = $"{UserRoles.Backoffice},{UserRoles.GridOperator}")]
        [HttpGet]
        public async Task<IActionResult> GetAllReservations([FromQuery] string? status)
        {
            var reservations = await _resService.GetAllReservationsAsync(status);
            return Ok(reservations);
        }

        // Backoffice / Grid Operator: Reads operational metrics for dashboard.
        [Authorize(Roles = $"{UserRoles.Backoffice},{UserRoles.GridOperator}")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var metrics = await _resService.GetDashboardMetricsAsync();
            return Ok(metrics);
        }
    }
}
