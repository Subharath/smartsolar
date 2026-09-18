// ============================================================================
// File: Program.cs
// Description: Application entry point configuring middleware, MongoDB, and DI.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using SmartSolarGrid.Api.Models;
using SmartSolarGrid.Api.Repositories;
using SmartSolarGrid.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Bind strongly typed Mongo configuration
var mongoSection = builder.Configuration.GetSection("MongoDbSettings");
builder.Services.Configure<MongoDbSettings>(mongoSection);
var mongoSettings = mongoSection.Get<MongoDbSettings>()!;

// Register singleton MongoClient and MongoDatabase instance
var mongoClient = new MongoClient(mongoSettings.ConnectionString);
var mongoDatabase = mongoClient.GetDatabase(mongoSettings.DatabaseName);
builder.Services.AddSingleton<IMongoDatabase>(mongoDatabase);

// Register generic repositories for the 4 collections
builder.Services.AddSingleton<IMongoRepository<User>>(
    new MongoRepository<User>(mongoDatabase, mongoSettings.UsersCollection));
builder.Services.AddSingleton<IMongoRepository<SolarStationInfo>>(
    new MongoRepository<SolarStationInfo>(mongoDatabase, mongoSettings.StationsCollection));
builder.Services.AddSingleton<IMongoRepository<EnergyBookingSlot>>(
    new MongoRepository<EnergyBookingSlot>(mongoDatabase, mongoSettings.SlotsCollection));
builder.Services.AddSingleton<IMongoRepository<EnergyReservation>>(
    new MongoRepository<EnergyReservation>(mongoDatabase, mongoSettings.ReservationsCollection));

// Register business services (FAT-service architecture)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INodeService, NodeService>();
builder.Services.AddScoped<IReservationService, ReservationService>();

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
