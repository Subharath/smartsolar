package com.example.solargrid

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Robust Centralized Networking Client for ASP.NET Core Web API.
 * Uses OkHttp, Gson, and local SQLite caching for reliable online & offline operation.
 */
object ApiClient {

    private val jsonMedia = "application/json; charset=utf-8".toMediaType()
    private val gson = Gson()

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .build()

    // Data Models
    data class AuthResult(
        val token: String,
        val nic: String,
        val fullName: String,
        val role: String,
        val status: String
    )

    data class StationModel(
        val id: String,
        val stationCode: String,
        val hubName: String,
        val latitude: Double,
        val longitude: Double,
        val capacityKwH: Double,
        val totalBatterySlots: Int,
        val availableBatterySlots: Int,
        val operationalSchedule: String?
    )

    data class ReservationModel(
        val id: String,
        val prosumerNic: String,
        val stationId: String,
        val slotId: String?,
        val scheduledDateTime: String,
        val energyAmountKwH: Double,
        val status: String,
        val qrPayloadToken: String,
        val createdAt: String?,
        val completedAt: String?
    )

    data class UserProfile(
        val nic: String,
        val fullName: String,
        val email: String,
        val role: String,
        val status: String
    )

    private fun getBaseUrl(context: Context): String = ApiConfig.getBaseUrl(context)

    private fun getToken(context: Context): String? {
        val db = SolarGridDbHelper(context)
        return db.getSession()?.token
    }

    // ==========================================
    // 1. Authentication Endpoints
    // ==========================================

    suspend fun login(context: Context, nicOrEmail: String, pass: String): Result<AuthResult> =
        withContext(Dispatchers.IO) {
            try {
                val url = "${getBaseUrl(context)}Auth/login"
                val json = gson.toJson(mapOf("nic" to nicOrEmail.trim(), "password" to pass))
                val request = Request.Builder()
                    .url(url)
                    .post(json.toRequestBody(jsonMedia))
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    val body = response.body?.string() ?: ""
                    if (response.isSuccessful) {
                        val auth = gson.fromJson(body, AuthResult::class.java)
                        // Save session to SQLite
                        val db = SolarGridDbHelper(context)
                        db.saveSession(
                            nic = auth.nic,
                            token = auth.token,
                            name = auth.fullName,
                            role = auth.role,
                            email = nicOrEmail
                        )
                        Result.success(auth)
                    } else {
                        val errorMsg = extractErrorMessage(body) ?: "Invalid credentials or account inactive."
                        Result.failure(IOException(errorMsg))
                    }
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun register(
        context: Context,
        nic: String,
        name: String,
        email: String,
        pass: String,
        role: String = "Prosumer"
    ): Result<AuthResult> = withContext(Dispatchers.IO) {
        try {
            val url = "${getBaseUrl(context)}Auth/register"
            val payload = mapOf(
                "nic" to nic.trim(),
                "fullName" to name.trim(),
                "email" to email.trim(),
                "password" to pass,
                "role" to role
            )
            val request = Request.Builder()
                .url(url)
                .post(gson.toJson(payload).toRequestBody(jsonMedia))
                .build()

            httpClient.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    val auth = gson.fromJson(body, AuthResult::class.java)
                    Result.success(auth)
                } else {
                    val errorMsg = extractErrorMessage(body) ?: "Registration failed."
                    Result.failure(IOException(errorMsg))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==========================================
    // 2. Microgrid Nodes Endpoints
    // ==========================================

    suspend fun getStations(context: Context): List<StationModel> = withContext(Dispatchers.IO) {
        val db = SolarGridDbHelper(context)
        try {
            val url = "${getBaseUrl(context)}MicrogridNodes?includeInactive=false"
            val request = Request.Builder().url(url).get().build()

            httpClient.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val body = response.body?.string() ?: ""
                    val type = object : TypeToken<List<StationModel>>() {}.type
                    val stations: List<StationModel> = gson.fromJson(body, type)

                    // Cache to SQLite
                    val cachedList = stations.map {
                        SolarGridDbHelper.CachedStation(
                            id = it.id,
                            stationCode = it.stationCode,
                            hubName = it.hubName,
                            latitude = it.latitude,
                            longitude = it.longitude,
                            capacity = it.capacityKwH,
                            slots = it.availableBatterySlots,
                            schedule = it.operationalSchedule ?: "08:00-18:00"
                        )
                    }
                    db.saveStations(cachedList)
                    return@withContext stations
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Offline Fallback: load from SQLite
        val cached = db.getCachedStations()
        cached.map {
            StationModel(
                id = it.id,
                stationCode = it.stationCode,
                hubName = it.hubName,
                latitude = it.latitude,
                longitude = it.longitude,
                capacityKwH = it.capacity,
                totalBatterySlots = it.slots,
                availableBatterySlots = it.slots,
                operationalSchedule = it.schedule
            )
        }
    }

    // ==========================================
    // 3. Reservations Endpoints
    // ==========================================

    suspend fun createReservation(
        context: Context,
        stationId: String,
        scheduledDateTimeIso: String,
        energyKwH: Double
    ): Result<ReservationModel> = withContext(Dispatchers.IO) {
        try {
            val token = getToken(context) ?: return@withContext Result.failure(IOException("User is not authenticated"))
            val url = "${getBaseUrl(context)}Reservations"
            val payload = mapOf(
                "stationId" to stationId,
                "slotId" to "",
                "scheduledDateTime" to scheduledDateTimeIso,
                "energyAmountKwH" to energyKwH
            )
            val request = Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer $token")
                .post(gson.toJson(payload).toRequestBody(jsonMedia))
                .build()

            httpClient.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    val res = gson.fromJson(body, ReservationModel::class.java)
                    Result.success(res)
                } else {
                    val errorMsg = extractErrorMessage(body) ?: "Failed to book slot. Check business rules."
                    Result.failure(IOException(errorMsg))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMyReservations(context: Context): List<ReservationModel> = withContext(Dispatchers.IO) {
        val db = SolarGridDbHelper(context)
        try {
            val token = getToken(context) ?: return@withContext emptyList()
            val url = "${getBaseUrl(context)}Reservations/my-history"
            val request = Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer $token")
                .get()
                .build()

            httpClient.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val body = response.body?.string() ?: ""
                    val type = object : TypeToken<List<ReservationModel>>() {}.type
                    val list: List<ReservationModel> = gson.fromJson(body, type)

                    // Cache in SQLite
                    val cached = list.map {
                        SolarGridDbHelper.CachedReservation(
                            id = it.id,
                            stationId = it.stationId,
                            stationName = it.stationId,
                            scheduledTime = it.scheduledDateTime,
                            energyKwH = it.energyAmountKwH,
                            status = it.status,
                            qrToken = it.qrPayloadToken
                        )
                    }
                    db.saveReservations(cached)
                    return@withContext list
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // Offline Fallback from SQLite
        val cached = db.getCachedReservations()
        cached.map {
            ReservationModel(
                id = it.id,
                prosumerNic = "",
                stationId = it.stationId,
                slotId = null,
                scheduledDateTime = it.scheduledTime,
                energyAmountKwH = it.energyKwH,
                status = it.status,
                qrPayloadToken = it.qrToken,
                createdAt = null,
                completedAt = null
            )
        }
    }

    // ==========================================
    // 4. Operator QR Verification & Finalization
    // ==========================================

    suspend fun finalizeTransfer(context: Context, qrToken: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val token = getToken(context) ?: return@withContext Result.failure(IOException("Operator is not authenticated"))
            val url = "${getBaseUrl(context)}Reservations/finalize-transfer"
            val payload = mapOf("qrToken" to qrToken.trim())

            val request = Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer $token")
                .post(gson.toJson(payload).toRequestBody(jsonMedia))
                .build()

            httpClient.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    Result.success("Energy transfer verified and transaction completed!")
                } else {
                    val errorMsg = extractErrorMessage(body) ?: "Invalid or expired QR token."
                    Result.failure(IOException(errorMsg))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==========================================
    // 5. Profile & Deactivation Endpoints
    // ==========================================

    suspend fun getProfile(context: Context): Result<UserProfile> = withContext(Dispatchers.IO) {
        try {
            val token = getToken(context) ?: return@withContext Result.failure(IOException("Not authenticated"))
            val url = "${getBaseUrl(context)}Auth/profile"
            val request = Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer $token")
                .get()
                .build()

            httpClient.newCall(request).execute().use { response ->
                val body = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    val profile = gson.fromJson(body, UserProfile::class.java)
                    Result.success(profile)
                } else {
                    Result.failure(IOException("Failed to fetch user profile."))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateProfile(context: Context, fullName: String, email: String): Result<Boolean> =
        withContext(Dispatchers.IO) {
            try {
                val token = getToken(context) ?: return@withContext Result.failure(IOException("Not authenticated"))
                val url = "${getBaseUrl(context)}Auth/profile"
                val payload = mapOf("fullName" to fullName, "email" to email)
                val request = Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer $token")
                    .put(gson.toJson(payload).toRequestBody(jsonMedia))
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        Result.success(true)
                    } else {
                        val body = response.body?.string() ?: ""
                        Result.failure(IOException(extractErrorMessage(body) ?: "Profile update failed."))
                    }
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun deactivateAccount(context: Context): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val token = getToken(context) ?: return@withContext Result.failure(IOException("Not authenticated"))
            val url = "${getBaseUrl(context)}Auth/deactivate-request"
            val request = Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer $token")
                .post("{}".toRequestBody(jsonMedia))
                .build()

            httpClient.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    SolarGridDbHelper(context).clearSession()
                    Result.success(true)
                } else {
                    val body = response.body?.string() ?: ""
                    Result.failure(IOException(extractErrorMessage(body) ?: "Account deactivation failed."))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun extractErrorMessage(jsonBody: String): String? {
        return try {
            val map = gson.fromJson(jsonBody, Map::class.java)
            map["message"]?.toString()
        } catch (e: Exception) {
            null
        }
    }
}
