# SmartSolar: Microgrid Peer-to-Peer Solar Energy Trading Platform

Enterprise Web API built with **ASP.NET Core 9** and **MongoDB**, facilitating localized solar energy microgrid management, charging slot reservations, and peer-to-peer energy trades.

## System Architecture

The solution follows a strict **FAT-Service Pattern**:
- **Controllers**: Thin HTTP adaptors handling serialization, routing, and role authorization.
- **Service Layer**: Centralized business logic, state workflows, scheduling constraints, and validation rules.
- **Generic Repository**: Abstracted MongoDB operations decoupling data persistence from application services.

## Core Features & Business Constraints

1. **User Identity & Roles**: Sri Lankan NIC validation (9 digits + V/X or 12 digits), BCrypt password hashing, and role-based access for Prosumers, Grid Operators, and Backoffice officers.
2. **Account Lifecycle**: Self-deactivation and strict Backoffice reactivation workflows.
3. **Microgrid Node Hubs**: Station capacity management, coordinates, and battery slot allocations. Hub deactivation is strictly blocked if active or future reservations exist.
4. **Energy Reservations**:
   - Must strictly be scheduled within **7 days** from creation date.
   - Updates and cancellations require at least **12 hours' advance notice**.
   - Cryptographic transaction tokens generated for QR code scanning.
   - Grid Operators scan and verify tokens to finalize physical energy transfers.
5. **Operational Dashboard**: Real-time aggregated metrics tracking pending trades, active hubs, and upcoming reservations.

## Running Locally

### Prerequisites
- .NET 9.0 SDK
- MongoDB Community Server running locally on port 27017

### Development Server
`ash
cd SmartSolarGrid.Api
dotnet run
`
API runs on http://localhost:5025.
