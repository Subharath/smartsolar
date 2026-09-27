package com.example.solargrid

import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

object DateUtils {

    private val supportedPatterns = listOf(
        "yyyy-MM-dd'T'HH:mm:ss",
        "yyyy-MM-dd'T'HH:mm",
        "yyyy-MM-dd HH:mm:ss",
        "yyyy-MM-dd HH:mm"
    )

    private val colomboFormatter = SimpleDateFormat("yyyy-MM-dd hh:mm a", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("Asia/Colombo") // Sri Lanka UTC+05:30
    }

    /**
     * Converts a UTC ISO-8601 string (e.g. 2026-10-10T04:57:00Z)
     * into Sri Lanka Standard Time (+05:30) (e.g. 2026-10-10 10:27 AM).
     */
    fun toSriLankaTime(isoString: String?): String {
        if (isoString.isNullOrEmpty()) return ""
        val clean = isoString.replace("Z", "").substringBefore(".")
        for (pattern in supportedPatterns) {
            try {
                val parser = SimpleDateFormat(pattern, Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }
                val date = parser.parse(clean)
                if (date != null) {
                    return colomboFormatter.format(date)
                }
            } catch (_: Exception) {
                // Try next pattern
            }
        }
        return isoString.replace("T", " ").take(16)
    }
}

