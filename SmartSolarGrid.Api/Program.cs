// ============================================================================
// File: Program.cs
// Description: Application entry point configuring middleware, MongoDB, DI, and Swagger.
// Module: SE4040 Enterprise Application Development
// ============================================================================

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using SmartSolarGrid.Api.Data;
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

// Configure JWT Authentication
var jwtSecret = builder.Configuration["JwtSettings:Secret"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers();

// Configure Swagger with JWT Bearer support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SmartSolar Microgrid Trading API",
        Version = "v1",
        Description = "SE4040 Enterprise Application Development - RESTful backend service for SmartSolar microgrids."
    });

    // Add JWT Bearer token support in Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Enable CORS so the React web client and mobile emulator can access the API across ports
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Enable Swagger UI in all environments for testing convenience
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartSolar API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Automatically seed sample data if MongoDB is available
try
{
    await DbInitializer.SeedAsync(mongoDatabase, mongoSettings);
}
catch (Exception ex)
{
    app.Logger.LogWarning("MongoDB auto-seed skipped: {Message}", ex.Message);
}

app.Run();
