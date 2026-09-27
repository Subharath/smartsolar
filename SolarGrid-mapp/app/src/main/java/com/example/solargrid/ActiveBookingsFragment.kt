package com.example.solargrid

import android.app.AlertDialog
import android.app.DatePickerDialog
import android.app.Dialog
import android.app.TimePickerDialog
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

class ActiveBookingsFragment : Fragment() {

    private var allActiveBookings: List<ApiClient.ReservationModel> = emptyList()
    private var currentQuery: String = ""

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_active_bookings, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        loadActiveBookings(view)
    }

    override fun onResume() {
        super.onResume()
        view?.let { loadActiveBookings(it) }
    }

    fun updateSearchQuery(query: String) {
        currentQuery = query.trim().lowercase()
        view?.let { renderBookings(it) }
    }

    private fun loadActiveBookings(rootView: View) {
        viewLifecycleOwner.lifecycleScope.launch {
            val db = SolarGridDbHelper(requireContext())
            if (db.getCachedStations().isEmpty()) {
                try { ApiClient.getStations(requireContext()) } catch (_: Exception) {}
            }
            val list = ApiClient.getMyReservations(requireContext())
            allActiveBookings = list.filter {
                it.status.equals("Approved", ignoreCase = true) ||
                        it.status.equals("Pending", ignoreCase = true)
            }
            renderBookings(rootView)
        }
    }

    private fun renderBookings(rootView: View) {
        val container = rootView.findViewById<LinearLayout>(R.id.activeBookingsContainer) ?: return
        container.removeAllViews()

        val filtered = allActiveBookings.filter {
            if (currentQuery.isEmpty()) true
            else {
                it.stationId.lowercase().contains(currentQuery) ||
                it.qrPayloadToken.lowercase().contains(currentQuery) ||
                it.status.lowercase().contains(currentQuery) ||
                it.scheduledDateTime.lowercase().contains(currentQuery)
            }
        }

        if (filtered.isEmpty()) {
            val emptyTv = TextView(requireContext()).apply {
                text = if (currentQuery.isNotEmpty()) "No matching active bookings found." else "No active reservations.\nSelect a nearby station to book your energy slot."
                setTextColor(android.graphics.Color.parseColor("#AFC7BC"))
                textSize = 14f
                gravity = Gravity.CENTER
                setPadding(32, 64, 32, 32)
            }
            container.addView(emptyTv)
            return
        }

        val stations = SolarGridDbHelper(requireContext()).getCachedStations()
        val inflater = LayoutInflater.from(requireContext())
        for (res in filtered) {
            val card = inflater.inflate(R.layout.item_booking_card, container, false)

            val stationName = stations.firstOrNull { it.id == res.stationId || it.stationCode == res.stationId }?.hubName
                ?: if (res.stationId.isNotEmpty()) "Station #${res.stationId.takeLast(6).uppercase()}" else "Solar Hub"

            card.findViewById<TextView>(R.id.cardStationTitle).text = stationName
            card.findViewById<TextView>(R.id.cardScheduledDate).text = DateUtils.toSriLankaTime(res.scheduledDateTime)

            card.findViewById<TextView>(R.id.cardStatusBadge).text = res.status
            card.findViewById<TextView>(R.id.cardTimeSlot).text = "Status: ${res.status} (Scan Required)"
            card.findViewById<TextView>(R.id.cardEnergy).text = "${res.energyAmountKwH} kWh"
            card.findViewById<TextView>(R.id.cardQrToken).text = "QR Token: ${res.qrPayloadToken}"

            // Show Action Buttons for Pending/Active Reservations
            val actionContainer = card.findViewById<LinearLayout>(R.id.cardActionContainer)
            actionContainer?.visibility = View.VISIBLE

            card.findViewById<View>(R.id.cardViewQrBtn)?.setOnClickListener {
                showQrDialog(res.qrPayloadToken)
            }

            card.findViewById<View>(R.id.cardModifyBtn)?.setOnClickListener {
                handleModifySlot(res, stationName)
            }

            card.findViewById<View>(R.id.cardCancelBtn)?.setOnClickListener {
                handleCancelSlot(res, stationName)
            }

            card.setOnClickListener {
                showQrDialog(res.qrPayloadToken)
            }

            container.addView(card)
        }
    }

    private fun getHoursNotice(scheduledDateTimeIso: String): Double {
        return try {
            val clean = scheduledDateTimeIso.replace("Z", "").substringBefore(".")
            val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val date = sdf.parse(clean) ?: return 0.0
            val diffMs = date.time - System.currentTimeMillis()
            diffMs / (1000.0 * 3600.0)
        } catch (_: Exception) {
            0.0
        }
    }

    private fun handleModifySlot(res: ApiClient.ReservationModel, stationName: String) {
        val notice = getHoursNotice(res.scheduledDateTime)
        if (notice < 12.0) {
            val hoursStr = String.format(Locale.US, "%.1f", notice.coerceAtLeast(0.0))
            Toast.makeText(
                requireContext(),
                "Modification rejected: Updates require at least 12 hours' notice. Only ${hoursStr}h remaining.",
                Toast.LENGTH_LONG
            ).show()
            return
        }

        // Show Date Picker constrained to 7 days
        val cal = Calendar.getInstance()
        val dpd = DatePickerDialog(requireContext(), { _, year, month, day ->
            // After date selected, show Time Picker
            TimePickerDialog(requireContext(), { _, hour, minute ->
                val newBookingCal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Colombo")).apply {
                    set(year, month, day, hour, minute, 0)
                    set(Calendar.MILLISECOND, 0)
                }

                val now = System.currentTimeMillis()
                val maxAllowed = now + (7L * 24 * 60 * 60 * 1000) + (4 * 3600 * 1000)
                if (newBookingCal.timeInMillis < now) {
                    Toast.makeText(requireContext(), "New slot cannot be in the past.", Toast.LENGTH_SHORT).show()
                    return@TimePickerDialog
                }
                if (newBookingCal.timeInMillis > maxAllowed) {
                    Toast.makeText(requireContext(), "New slot must be within 7 days from now.", Toast.LENGTH_SHORT).show()
                    return@TimePickerDialog
                }

                val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                    timeZone = TimeZone.getTimeZone("UTC")
                }
                val newScheduledIso = isoFormat.format(newBookingCal.time)

                Toast.makeText(requireContext(), "Updating reservation...", Toast.LENGTH_SHORT).show()
                viewLifecycleOwner.lifecycleScope.launch {
                    val result = ApiClient.updateReservation(
                        requireContext(),
                        res.id,
                        newScheduledIso,
                        res.energyAmountKwH
                    )
                    if (result.isSuccess) {
                        Toast.makeText(requireContext(), "Reservation modified successfully!", Toast.LENGTH_SHORT).show()
                        view?.let { loadActiveBookings(it) }
                    } else {
                        Toast.makeText(requireContext(), result.exceptionOrNull()?.message ?: "Failed to update reservation", Toast.LENGTH_LONG).show()
                    }
                }
            }, 10, 0, true).show()
        }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH))

        dpd.datePicker.minDate = System.currentTimeMillis() - 1000
        dpd.datePicker.maxDate = System.currentTimeMillis() + (7L * 24 * 60 * 60 * 1000)
        dpd.show()
    }

    private fun handleCancelSlot(res: ApiClient.ReservationModel, stationName: String) {
        val notice = getHoursNotice(res.scheduledDateTime)
        if (notice < 12.0) {
            val hoursStr = String.format(Locale.US, "%.1f", notice.coerceAtLeast(0.0))
            Toast.makeText(
                requireContext(),
                "Cancellation rejected: Cancellations require at least 12 hours' notice. Only ${hoursStr}h remaining.",
                Toast.LENGTH_LONG
            ).show()
            return
        }

        AlertDialog.Builder(requireContext())
            .setTitle("Cancel Reservation")
            .setMessage("Are you sure you want to cancel your slot at $stationName?\n\n(Notice requirement of 12 hours is met: ${String.format(Locale.US, "%.1f", notice)}h remaining)")
            .setPositiveButton("Yes, Cancel") { _, _ ->
                Toast.makeText(requireContext(), "Cancelling reservation...", Toast.LENGTH_SHORT).show()
                viewLifecycleOwner.lifecycleScope.launch {
                    val result = ApiClient.cancelReservation(requireContext(), res.id)
                    if (result.isSuccess) {
                        Toast.makeText(requireContext(), "Reservation cancelled successfully.", Toast.LENGTH_SHORT).show()
                        view?.let { loadActiveBookings(it) }
                    } else {
                        Toast.makeText(requireContext(), result.exceptionOrNull()?.message ?: "Failed to cancel reservation", Toast.LENGTH_LONG).show()
                    }
                }
            }
            .setNegativeButton("Keep Slot", null)
            .show()
    }

    private fun showQrDialog(qrToken: String) {
        val dialog = Dialog(requireContext())
        dialog.setContentView(R.layout.dialog_qr_code)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        dialog.window?.setGravity(Gravity.CENTER)

        val qrImageView = dialog.findViewById<ImageView>(R.id.qrImageView)
        val tokenText = dialog.findViewById<TextView>(R.id.tokenText)
        val downloadBtn = dialog.findViewById<View>(R.id.downloadQrButton)
        val doneBtn = dialog.findViewById<TextView>(R.id.doneButton)

        tokenText.text = qrToken
        val qrBitmap = QrCodeGenerator.generateQrCode(qrToken)
        if (qrBitmap != null) {
            qrImageView.setImageBitmap(qrBitmap)
        }

        downloadBtn.setOnClickListener {
            if (qrBitmap != null) {
                val success = QrCodeGenerator.saveQrToGallery(requireContext(), qrBitmap, qrToken)
                if (success) {
                    Toast.makeText(requireContext(), "QR Code saved to gallery!", Toast.LENGTH_SHORT).show()
                }
            }
        }

        doneBtn.setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
        dialog.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.88).toInt().coerceAtMost((400 * resources.displayMetrics.density).toInt()),
            WindowManager.LayoutParams.WRAP_CONTENT
        )
    }
}

