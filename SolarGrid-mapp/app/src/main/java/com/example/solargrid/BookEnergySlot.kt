package com.example.solargrid

import android.app.DatePickerDialog
import android.app.Dialog
import android.app.TimePickerDialog
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

class BookEnergySlot : AppCompatActivity() {

    private var selectedCalendar: Calendar? = null
    private var selectedHour: Int = -1
    private var selectedMinute: Int = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_book_energy_slot)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Back button
        findViewById<ImageView>(R.id.backButton).setOnClickListener {
            startActivity(Intent(this, PowerStationSelection::class.java))
            finish()
        }

        // Station details from intent
        val stationId = intent.getStringExtra("station_id") ?: ""
        val stationName = intent.getStringExtra("station_name") ?: "Selected Microgrid Hub"
        findViewById<TextView>(R.id.selectedStationName).text = stationName

        // Date Picker
        val dateButton = findViewById<TextView>(R.id.dateButton)
        dateButton.setOnClickListener {
            val calendar = Calendar.getInstance()
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH)
            val day = calendar.get(Calendar.DAY_OF_MONTH)

            DatePickerDialog(this, { _, selectedYear, selectedMonth, selectedDay ->
                val chosenCal = Calendar.getInstance()
                chosenCal.set(selectedYear, selectedMonth, selectedDay)
                selectedCalendar = chosenCal

                val formattedDate = String.format(Locale.getDefault(), "%02d/%02d/%d", selectedDay, selectedMonth + 1, selectedYear)
                dateButton.text = formattedDate
                dateButton.setTextColor(Color.WHITE)
            }, year, month, day).show()
        }

        // Start Time Picker
        val startTimeButton = findViewById<TextView>(R.id.startTimeButton)
        startTimeButton.setOnClickListener {
            val calendar = Calendar.getInstance()
            val hour = calendar.get(Calendar.HOUR_OF_DAY)
            val minute = calendar.get(Calendar.MINUTE)

            TimePickerDialog(this, { _, hourOfDay, minuteOfHour ->
                selectedHour = hourOfDay
                selectedMinute = minuteOfHour

                val formattedTime = String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minuteOfHour)
                startTimeButton.text = formattedTime
                startTimeButton.setTextColor(Color.WHITE)
            }, hour, minute, true).show()
        }

        // End Time Picker
        val endTimeButton = findViewById<TextView>(R.id.endTimeButton)
        endTimeButton.setOnClickListener {
            val calendar = Calendar.getInstance()
            val hour = calendar.get(Calendar.HOUR_OF_DAY)
            val minute = calendar.get(Calendar.MINUTE)

            TimePickerDialog(this, { _, hourOfDay, minuteOfHour ->
                val formattedTime = String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minuteOfHour)
                endTimeButton.text = formattedTime
                endTimeButton.setTextColor(Color.WHITE)
            }, hour, minute, true).show()
        }

        // Book Energy Slot Button
        val bookBtn = findViewById<View>(R.id.bookEnergySlotButton)
        bookBtn.setOnClickListener {
            val cal = selectedCalendar
            if (cal == null || selectedHour == -1) {
                Toast.makeText(this, "Please select both a date and start time", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Construct booking ISO DateTime in Sri Lanka (+05:30) Time
            val bookingCal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Colombo")).apply {
                timeInMillis = cal.timeInMillis
                set(Calendar.HOUR_OF_DAY, selectedHour)
                set(Calendar.MINUTE, selectedMinute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }

            val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val scheduledIso = isoFormat.format(bookingCal.time)

            bookBtn.isEnabled = false
            Toast.makeText(this, "Reserving energy slot with microgrid...", Toast.LENGTH_SHORT).show()

            lifecycleScope.launch {
                val targetStationRef = if (stationId.isNotEmpty()) stationId else stationName
                val result = ApiClient.createReservation(
                    context = this@BookEnergySlot,
                    stationId = targetStationRef,
                    scheduledDateTimeIso = scheduledIso,
                    energyKwH = 25.0
                )
                bookBtn.isEnabled = true

                if (result.isSuccess) {
                    val reservation = result.getOrThrow()
                    val realQrPayloadToken = reservation.qrPayloadToken

                    // Generate QR Code bitmap from the real server token
                    val qrBitmap = QrCodeGenerator.generateQrCode(realQrPayloadToken)

                    // Show QR Code Dialog
                    val dialog = Dialog(this@BookEnergySlot)
                    dialog.setContentView(R.layout.dialog_qr_code)
                    dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
                    dialog.window?.setGravity(Gravity.CENTER)

                    val qrImageView = dialog.findViewById<ImageView>(R.id.qrImageView)
                    val tokenText = dialog.findViewById<TextView>(R.id.tokenText)
                    val downloadBtn = dialog.findViewById<View>(R.id.downloadQrButton)
                    val doneBtn = dialog.findViewById<TextView>(R.id.doneButton)

                    tokenText.text = realQrPayloadToken
                    if (qrBitmap != null) {
                        qrImageView.setImageBitmap(qrBitmap)
                    }

                    downloadBtn.setOnClickListener {
                        if (qrBitmap != null) {
                            val success = QrCodeGenerator.saveQrToGallery(this@BookEnergySlot, qrBitmap, realQrPayloadToken)
                            if (success) {
                                Toast.makeText(this@BookEnergySlot, "QR Code saved to Pictures gallery!", Toast.LENGTH_LONG).show()
                            } else {
                                Toast.makeText(this@BookEnergySlot, "Failed to save QR Code", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }

                    doneBtn.setOnClickListener {
                        dialog.dismiss()
                        startActivity(Intent(this@BookEnergySlot, ProcumerDashboard::class.java))
                        finish()
                    }

                    dialog.show()
                    dialog.window?.setLayout(
                        (resources.displayMetrics.widthPixels * 0.88).toInt().coerceAtMost((400 * resources.displayMetrics.density).toInt()),
                        WindowManager.LayoutParams.WRAP_CONTENT
                    )
                } else {
                    val error = result.exceptionOrNull()?.message ?: "Booking failed."
                    Toast.makeText(this@BookEnergySlot, error, Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
