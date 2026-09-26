package com.example.solargrid

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.os.Build
import android.provider.MediaStore
import com.google.zxing.BarcodeFormat
import com.journeyapps.barcodescanner.BarcodeEncoder

object QrCodeGenerator {

    /** Converts a payload token string into a QR Code Bitmap */
    fun generateQrCode(token: String, width: Int = 600, height: Int = 600): Bitmap? {
        return try {
            val barcodeEncoder = BarcodeEncoder()
            barcodeEncoder.encodeBitmap(token, BarcodeFormat.QR_CODE, width, height)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /** Saves a QR Code Bitmap to the device's Pictures gallery */
    fun saveQrToGallery(context: Context, bitmap: Bitmap, token: String): Boolean {
        val filename = "SolarGrid_QR_${token.replace("-", "_")}_${System.currentTimeMillis()}.png"
        val contentValues = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
            put(MediaStore.MediaColumns.MIME_TYPE, "image/png")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.MediaColumns.RELATIVE_PATH, "Pictures/SolarGrid")
            }
        }

        val resolver = context.contentResolver
        val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues) ?: return false

        return try {
            resolver.openOutputStream(uri)?.use { outputStream ->
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
