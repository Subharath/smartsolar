package com.example.solargrid

import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class BookingHistoryFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_booking_history, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        loadHistory(view)
    }

    override fun onResume() {
        super.onResume()
        view?.let { loadHistory(it) }
    }

    private fun loadHistory(rootView: View) {
        val container = rootView.findViewById<LinearLayout>(R.id.historyBookingsContainer) ?: return

        viewLifecycleOwner.lifecycleScope.launch {
            val list = ApiClient.getMyReservations(requireContext())
            val historyList = list.filter {
                it.status.equals("Completed", ignoreCase = true) ||
                        it.status.equals("Cancelled", ignoreCase = true)
            }

            container.removeAllViews()

            if (historyList.isEmpty()) {
                val emptyTv = TextView(requireContext()).apply {
                    text = "No previous booking history."
                    setTextColor(android.graphics.Color.parseColor("#AFC7BC"))
                    textSize = 14f
                    gravity = Gravity.CENTER
                    setPadding(32, 64, 32, 32)
                }
                container.addView(emptyTv)
                return@launch
            }

            val inflater = LayoutInflater.from(requireContext())
            for (res in historyList) {
                val card = inflater.inflate(R.layout.item_booking_card, container, false)

                card.findViewById<TextView>(R.id.cardStationTitle).text =
                    if (res.stationId.isNotEmpty()) "Station #${res.stationId.takeLast(6).uppercase()}" else "Solar Hub"

                card.findViewById<TextView>(R.id.cardScheduledDate).text =
                    res.scheduledDateTime.replace("T", " ").take(16)

                card.findViewById<TextView>(R.id.cardStatusBadge).text = res.status
                card.findViewById<TextView>(R.id.cardTimeSlot).text = "Status: ${res.status}"
                card.findViewById<TextView>(R.id.cardEnergy).text = "${res.energyAmountKwH} kWh"
                card.findViewById<TextView>(R.id.cardQrToken).text = "Token: ${res.qrPayloadToken}"

                container.addView(card)
            }
        }
    }
}
