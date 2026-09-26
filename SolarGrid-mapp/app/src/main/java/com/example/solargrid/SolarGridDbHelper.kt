package com.example.solargrid

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

/**
 * Local SQLite Database for Offline Persistence.
 * Required by Module SE4040: Enterprise Application Development.
 */
class SolarGridDbHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "solargrid_local.db"
        const val DATABASE_VERSION = 1

        // User session table
        const val TABLE_USER = "user_session"
        const val COL_USER_NIC = "nic"
        const val COL_USER_TOKEN = "token"
        const val COL_USER_NAME = "name"
        const val COL_USER_ROLE = "role"
        const val COL_USER_EMAIL = "email"

        // Cached stations table
        const val TABLE_STATIONS = "cached_stations"
        const val COL_STATION_ID = "id"
        const val COL_STATION_CODE = "station_code"
        const val COL_STATION_NAME = "hub_name"
        const val COL_STATION_LAT = "latitude"
        const val COL_STATION_LNG = "longitude"
        const val COL_STATION_CAPACITY = "capacity"
        const val COL_STATION_SLOTS = "slots"
        const val COL_STATION_SCHEDULE = "schedule"

        // Cached reservations table
        const val TABLE_RESERVATIONS = "cached_reservations"
        const val COL_RES_ID = "id"
        const val COL_RES_STATION_ID = "station_id"
        const val COL_RES_STATION_NAME = "station_name"
        const val COL_RES_SCHEDULED_TIME = "scheduled_time"
        const val COL_RES_ENERGY = "energy_kwh"
        const val COL_RES_STATUS = "status"
        const val COL_RES_QR_TOKEN = "qr_token"
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createUserTable = """
            CREATE TABLE $TABLE_USER (
                $COL_USER_NIC TEXT PRIMARY KEY,
                $COL_USER_TOKEN TEXT,
                $COL_USER_NAME TEXT,
                $COL_USER_ROLE TEXT,
                $COL_USER_EMAIL TEXT
            )
        """.trimIndent()

        val createStationsTable = """
            CREATE TABLE $TABLE_STATIONS (
                $COL_STATION_ID TEXT PRIMARY KEY,
                $COL_STATION_CODE TEXT,
                $COL_STATION_NAME TEXT,
                $COL_STATION_LAT REAL,
                $COL_STATION_LNG REAL,
                $COL_STATION_CAPACITY REAL,
                $COL_STATION_SLOTS INTEGER,
                $COL_STATION_SCHEDULE TEXT
            )
        """.trimIndent()

        val createReservationsTable = """
            CREATE TABLE $TABLE_RESERVATIONS (
                $COL_RES_ID TEXT PRIMARY KEY,
                $COL_RES_STATION_ID TEXT,
                $COL_RES_STATION_NAME TEXT,
                $COL_RES_SCHEDULED_TIME TEXT,
                $COL_RES_ENERGY REAL,
                $COL_RES_STATUS TEXT,
                $COL_RES_QR_TOKEN TEXT
            )
        """.trimIndent()

        db.execSQL(createUserTable)
        db.execSQL(createStationsTable)
        db.execSQL(createReservationsTable)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_USER")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_STATIONS")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_RESERVATIONS")
        onCreate(db)
    }

    // --- Session Operations ---

    fun saveSession(nic: String, token: String, name: String, role: String, email: String) {
        val db = writableDatabase
        db.delete(TABLE_USER, null, null) // Keep active user only
        val values = ContentValues().apply {
            put(COL_USER_NIC, nic)
            put(COL_USER_TOKEN, token)
            put(COL_USER_NAME, name)
            put(COL_USER_ROLE, role)
            put(COL_USER_EMAIL, email)
        }
        db.insertWithOnConflict(TABLE_USER, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    data class UserSession(val nic: String, val token: String, val name: String, val role: String, val email: String)

    fun getSession(): UserSession? {
        val db = readableDatabase
        val cursor = db.query(TABLE_USER, null, null, null, null, null, null)
        return cursor.use {
            if (it.moveToFirst()) {
                UserSession(
                    nic = it.getString(it.getColumnIndexOrThrow(COL_USER_NIC)),
                    token = it.getString(it.getColumnIndexOrThrow(COL_USER_TOKEN)),
                    name = it.getString(it.getColumnIndexOrThrow(COL_USER_NAME)),
                    role = it.getString(it.getColumnIndexOrThrow(COL_USER_ROLE)),
                    email = it.getString(it.getColumnIndexOrThrow(COL_USER_EMAIL))
                )
            } else {
                null
            }
        }
    }

    fun clearSession() {
        val db = writableDatabase
        db.delete(TABLE_USER, null, null)
    }

    // --- Stations Cache ---

    data class CachedStation(
        val id: String,
        val stationCode: String,
        val hubName: String,
        val latitude: Double,
        val longitude: Double,
        val capacity: Double,
        val slots: Int,
        val schedule: String
    )

    fun saveStations(stations: List<CachedStation>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            db.delete(TABLE_STATIONS, null, null)
            for (st in stations) {
                val cv = ContentValues().apply {
                    put(COL_STATION_ID, st.id)
                    put(COL_STATION_CODE, st.stationCode)
                    put(COL_STATION_NAME, st.hubName)
                    put(COL_STATION_LAT, st.latitude)
                    put(COL_STATION_LNG, st.longitude)
                    put(COL_STATION_CAPACITY, st.capacity)
                    put(COL_STATION_SLOTS, st.slots)
                    put(COL_STATION_SCHEDULE, st.schedule)
                }
                db.insertWithOnConflict(TABLE_STATIONS, null, cv, SQLiteDatabase.CONFLICT_REPLACE)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun getCachedStations(): List<CachedStation> {
        val list = mutableListOf<CachedStation>()
        val db = readableDatabase
        val cursor = db.query(TABLE_STATIONS, null, null, null, null, null, null)
        cursor.use {
            while (it.moveToNext()) {
                list.add(
                    CachedStation(
                        id = it.getString(it.getColumnIndexOrThrow(COL_STATION_ID)),
                        stationCode = it.getString(it.getColumnIndexOrThrow(COL_STATION_CODE)),
                        hubName = it.getString(it.getColumnIndexOrThrow(COL_STATION_NAME)),
                        latitude = it.getDouble(it.getColumnIndexOrThrow(COL_STATION_LAT)),
                        longitude = it.getDouble(it.getColumnIndexOrThrow(COL_STATION_LNG)),
                        capacity = it.getDouble(it.getColumnIndexOrThrow(COL_STATION_CAPACITY)),
                        slots = it.getInt(it.getColumnIndexOrThrow(COL_STATION_SLOTS)),
                        schedule = it.getString(it.getColumnIndexOrThrow(COL_STATION_SCHEDULE))
                    )
                )
            }
        }
        return list
    }

    // --- Reservations Cache ---

    data class CachedReservation(
        val id: String,
        val stationId: String,
        val stationName: String,
        val scheduledTime: String,
        val energyKwH: Double,
        val status: String,
        val qrToken: String
    )

    fun saveReservations(reservations: List<CachedReservation>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            db.delete(TABLE_RESERVATIONS, null, null)
            for (r in reservations) {
                val cv = ContentValues().apply {
                    put(COL_RES_ID, r.id)
                    put(COL_RES_STATION_ID, r.stationId)
                    put(COL_RES_STATION_NAME, r.stationName)
                    put(COL_RES_SCHEDULED_TIME, r.scheduledTime)
                    put(COL_RES_ENERGY, r.energyKwH)
                    put(COL_RES_STATUS, r.status)
                    put(COL_RES_QR_TOKEN, r.qrToken)
                }
                db.insertWithOnConflict(TABLE_RESERVATIONS, null, cv, SQLiteDatabase.CONFLICT_REPLACE)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun getCachedReservations(): List<CachedReservation> {
        val list = mutableListOf<CachedReservation>()
        val db = readableDatabase
        val cursor = db.query(TABLE_RESERVATIONS, null, null, null, null, null, null)
        cursor.use {
            while (it.moveToNext()) {
                list.add(
                    CachedReservation(
                        id = it.getString(it.getColumnIndexOrThrow(COL_RES_ID)),
                        stationId = it.getString(it.getColumnIndexOrThrow(COL_RES_STATION_ID)),
                        stationName = it.getString(it.getColumnIndexOrThrow(COL_RES_STATION_NAME)),
                        scheduledTime = it.getString(it.getColumnIndexOrThrow(COL_RES_SCHEDULED_TIME)),
                        energyKwH = it.getDouble(it.getColumnIndexOrThrow(COL_RES_ENERGY)),
                        status = it.getString(it.getColumnIndexOrThrow(COL_RES_STATUS)),
                        qrToken = it.getString(it.getColumnIndexOrThrow(COL_RES_QR_TOKEN))
                    )
                )
            }
        }
        return list
    }
}
