// ============================================================================
// File: DbInitializer.cs
// Description: Seeds sample data for MongoDB if database collections are empty.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using MongoDB.Driver;
using SmartSolarGrid.Api.Models;

namespace SmartSolarGrid.Api.Data
{
    public static class DbInitializer
    {
        // Seeds initial users, solar hubs, slots, and reservations if MongoDB is unseeded.
        public static async Task SeedAsync(IMongoDatabase database, MongoDbSettings settings)
        {
            var usersCollection = database.GetCollection<User>(settings.UsersCollection);
            var stationsCollection = database.GetCollection<SolarStationInfo>(settings.StationsCollection);
            var slotsCollection = database.GetCollection<EnergyBookingSlot>(settings.SlotsCollection);
            var reservationsCollection = database.GetCollection<EnergyReservation>(settings.ReservationsCollection);

            // 1. Seed Users if empty (with a 2-second timeout so startup never hangs if MongoDB is stopped)
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));
            var userCount = await usersCollection.CountDocumentsAsync(_ => true, cancellationToken: cts.Token);
            if (userCount == 0)
            {
                var users = new List<User>
                {
                    new User
                    {
                        Nic = "199012345678",
                        FullName = "Backoffice Admin",
                        Email = "admin@smartsolar.lk",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        Role = UserRoles.Backoffice,
                        Status = AccountStatus.Active,
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Nic = "199512345678",
                        FullName = "Grid Operator Perera",
                        Email = "operator@smartsolar.lk",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Operator@123"),
                        Role = UserRoles.GridOperator,
                        Status = AccountStatus.Active,
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Nic = "200012345678",
                        FullName = "Kamal Silva (Prosumer)",
                        Email = "kamal@gmail.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Kamal@123"),
                        Role = UserRoles.Prosumer,
                        Status = AccountStatus.Active,
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Nic = "111111111V",
                        FullName = "John Prosumer",
                        Email = "john@smartsolar.lk",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                        Role = UserRoles.Prosumer,
                        Status = AccountStatus.Active,
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Nic = "222222222V",
                        FullName = "Jane Operator",
                        Email = "jane@smartsolar.lk",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                        Role = UserRoles.GridOperator,
                        Status = AccountStatus.Active,
                        CreatedAt = DateTime.UtcNow
                    },
                    new User
                    {
                        Nic = "199212345678",
                        FullName = "Sunil Fernando (Inactive)",
                        Email = "sunil@gmail.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Sunil@123"),
                        Role = UserRoles.Prosumer,
                        Status = AccountStatus.Inactive,
                        CreatedAt = DateTime.UtcNow
                    }
                };
                await usersCollection.InsertManyAsync(users);
            }

            // 2. Seed Solar Stations if empty
            var stationCount = await stationsCollection.CountDocumentsAsync(_ => true);
            if (stationCount == 0)
            {
                var stations = new List<SolarStationInfo>
                {
                    new SolarStationInfo
                    {
                        StationCode = "CMB-01",
                        HubName = "Colombo Central Microgrid",
                        Latitude = 6.9271,
                        Longitude = 79.8612,
                        CapacityKwH = 150.0,
                        TotalBatterySlots = 10,
                        AvailableBatterySlots = 8,
                        OperationalSchedule = "08:00-18:00",
                        IsActive = true
                    },
                    new SolarStationInfo
                    {
                        StationCode = "KDY-01",
                        HubName = "Kandy Hills Solar Hub",
                        Latitude = 7.2906,
                        Longitude = 80.6337,
                        CapacityKwH = 200.0,
                        TotalBatterySlots = 12,
                        AvailableBatterySlots = 11,
                        OperationalSchedule = "07:00-19:00",
                        IsActive = true
                    },
                    new SolarStationInfo
                    {
                        StationCode = "GLE-01",
                        HubName = "Galle Coastal Solar Station",
                        Latitude = 6.0535,
                        Longitude = 80.2210,
                        CapacityKwH = 120.0,
                        TotalBatterySlots = 8,
                        AvailableBatterySlots = 8,
                        OperationalSchedule = "08:30-17:30",
                        IsActive = true
                    }
                };
                await stationsCollection.InsertManyAsync(stations);

                // 3. Seed Slots for the Colombo station
                var colomboNode = await stationsCollection.Find(s => s.StationCode == "CMB-01").FirstOrDefaultAsync();
                if (colomboNode != null)
                {
                    var baseDate = DateTime.UtcNow.Date.AddDays(1);
                    var slots = new List<EnergyBookingSlot>
                    {
                        new EnergyBookingSlot
                        {
                            StationId = colomboNode.Id,
                            StartTime = baseDate.AddHours(9),
                            EndTime = baseDate.AddHours(11),
                            MaxSlotCapacityKwH = 30.0,
                            IsAvailable = true
                        },
                        new EnergyBookingSlot
                        {
                            StationId = colomboNode.Id,
                            StartTime = baseDate.AddHours(11),
                            EndTime = baseDate.AddHours(13),
                            MaxSlotCapacityKwH = 40.0,
                            IsAvailable = true
                        },
                        new EnergyBookingSlot
                        {
                            StationId = colomboNode.Id,
                            StartTime = baseDate.AddHours(14),
                            EndTime = baseDate.AddHours(16),
                            MaxSlotCapacityKwH = 35.0,
                            IsAvailable = true
                        }
                    };
                    await slotsCollection.InsertManyAsync(slots);

                    // 4. Seed a sample reservation
                    var sampleSlot = await slotsCollection.Find(s => s.StationId == colomboNode.Id).FirstOrDefaultAsync();
                    if (sampleSlot != null)
                    {
                        var reservation = new EnergyReservation
                        {
                            ProsumerNic = "200012345678",
                            StationId = colomboNode.Id,
                            SlotId = sampleSlot.Id,
                            ScheduledDateTime = sampleSlot.StartTime,
                            EnergyAmountKwH = 25.0,
                            Status = ReservationStatus.Approved,
                            QrPayloadToken = "SOLAR-TX-DEMO2026",
                            CreatedAt = DateTime.UtcNow
                        };
                        await reservationsCollection.InsertOneAsync(reservation);
                    }
                }
            }
        }
    }
}
