package com.example.solargrid

import android.content.Context
import android.content.SharedPreferences

/**
 * Configuration for SmartSolarGrid REST Web API.
 * Default emulator IP: http://10.0.2.2:5025/api/
 * Physical Device: Configurable to your PC's LAN IP (e.g., http://192.168.x.x:5025/api/)
 */
object ApiConfig {
    private const val PREFS_NAME = "solargrid_api_prefs"
    private const val KEY_BASE_URL = "base_url"

    // Default port 5025 matches ASP.NET Core API launchSettings.json
    private const val DEFAULT_BASE_URL = "http://10.0.2.2:5025/api/"

    fun getBaseUrl(context: Context): String {
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
    }

    fun setBaseUrl(context: Context, newUrl: String) {
        val formatted = if (newUrl.endsWith("/")) newUrl else "$newUrl/"
        val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_BASE_URL, formatted).apply()
    }
}
