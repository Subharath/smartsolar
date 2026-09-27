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

    private var allHistoryBookings: List<ApiClient.ReservationModel> = emptyList()
    private var currentQuery: String = ""

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

    fun updateSearchQuery(query: String) {
        currentQuery = query.trim().lowercase()
        view?.let { renderHistory(it) }
    }

    private fun loadHistory(rootView: View) {
        viewLifecycleOwner.lifecycleScope.launch {
            val db = SolarGridDbHelper(requireContext())
            if (db.getCachedStations().isEmpty()) {
                try { ApiClient.getStations(requireContext()) } catch (_: Exception) {}
            }
            val list = ApiClient.getMyReservations(requireContext())
            allHistoryBookings = list.filter {
                it.status.equals("Completed", ignoreCase = true) ||
                        it.status.equals("Cancelled", ignoreCase = true) ||
                        it.status.equals("Rejected", ignoreCase = true)
            }
            renderHistory(rootView)
        }
    }

    private fun renderHistory(rootView: View) {
        val container = rootView.findViewById<LinearLayout>(R.id.historyBookingsContainer) ?: return
        container.removeAllViews()

        val filtered = allHistoryBookings.filter {
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
                text = if (currentQuery.isNotEmpty()) "No matching booking history found." else "No previous booking history."
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

            val badge = card.findViewById<TextView>(R.id.cardStatusBadge)
            badge.text = res.status
            badge.setBackgroundResource(R.drawable.today_badge)

            card.findViewById<TextView>(R.id.cardTimeSlot).text = "Status: ${res.status}"
            card.findViewById<TextView>(R.id.cardEnergy).text = "${res.energyAmountKwH} kWh"
            card.findViewById<TextView>(R.id.cardQrToken).text = "Token: ${res.qrPayloadToken}"

            container.addView(card)
        }
    }
}
