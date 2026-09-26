package com.example.solargrid

import android.app.Dialog
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

class ActiveBookingsFragment : Fragment() {

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

    private fun loadActiveBookings(rootView: View) {
        val container = rootView.findViewById<LinearLayout>(R.id.activeBookingsContainer) ?: return

        viewLifecycleOwner.lifecycleScope.launch {
            val list = ApiClient.getMyReservations(requireContext())
            val activeList = list.filter {
                it.status.equals("Approved", ignoreCase = true) ||
                        it.status.equals("Pending", ignoreCase = true)
            }

            container.removeAllViews()

            if (activeList.isEmpty()) {
                val emptyTv = TextView(requireContext()).apply {
                    text = "No active reservations.\nSelect a nearby station to book your energy slot."
                    setTextColor(android.graphics.Color.parseColor("#AFC7BC"))
                    textSize = 14f
                    gravity = Gravity.CENTER
                    setPadding(32, 64, 32, 32)
                }
                container.addView(emptyTv)
                return@launch
            }

            val inflater = LayoutInflater.from(requireContext())
            for (res in activeList) {
                val card = inflater.inflate(R.layout.item_booking_card, container, false)

                card.findViewById<TextView>(R.id.cardStationTitle).text =
                    if (res.stationId.isNotEmpty()) "Station #${res.stationId.takeLast(6).uppercase()}" else "Solar Hub"

                card.findViewById<TextView>(R.id.cardScheduledDate).text =
                    res.scheduledDateTime.replace("T", " ").take(16)

                card.findViewById<TextView>(R.id.cardStatusBadge).text = res.status
                card.findViewById<TextView>(R.id.cardTimeSlot).text = "Status: ${res.status}"
                card.findViewById<TextView>(R.id.cardEnergy).text = "${res.energyAmountKwH} kWh"
                card.findViewById<TextView>(R.id.cardQrToken).text = "QR: ${res.qrPayloadToken}"

                card.setOnClickListener {
                    showQrDialog(res.qrPayloadToken)
                }

                container.addView(card)
            }
        }
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
            (320 * resources.displayMetrics.density).toInt(),
            WindowManager.LayoutParams.WRAP_CONTENT
        )
    }
}
