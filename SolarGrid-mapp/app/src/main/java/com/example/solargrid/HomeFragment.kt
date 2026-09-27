package com.example.solargrid

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import kotlinx.coroutines.launch

class HomeFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_home, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Set user greeting from session
        val session = SolarGridDbHelper(requireContext()).getSession()
        if (session != null) {
            val firstName = session.name.split(" ").firstOrNull() ?: session.name
            view.findViewById<TextView>(R.id.userNameGreeting)?.text = "$firstName,"
        }

        // Navigate to Power Station Selection
        view.findViewById<View>(R.id.bookEnergyButton)?.setOnClickListener {
            val intent = Intent(requireContext(), PowerStationSelection::class.java)
            startActivity(intent)
        }

        // Navigate to Bookings fragment when tapping counts
        val navToBookings = View.OnClickListener {
            try {
                findNavController().navigate(R.id.nav_bookings)
            } catch (_: Exception) {}
        }
        view.findViewById<View>(R.id.reservationCardOne)?.setOnClickListener(navToBookings)
        view.findViewById<View>(R.id.reservationCardTwo)?.setOnClickListener(navToBookings)
        view.findViewById<View>(R.id.currentReservationCard)?.setOnClickListener(navToBookings)

        // Load dashboard stats
        loadDashboardStats(view)
    }

    override fun onResume() {
        super.onResume()
        view?.let { loadDashboardStats(it) }
    }

    private fun loadDashboardStats(rootView: View) {
        viewLifecycleOwner.lifecycleScope.launch {
            val db = SolarGridDbHelper(requireContext())
            if (db.getCachedStations().isEmpty()) {
                try { ApiClient.getStations(requireContext()) } catch (_: Exception) {}
            }
            val list = ApiClient.getMyReservations(requireContext())
            val activeCount = list.count { it.status.equals("Approved", ignoreCase = true) }
            val pendingCount = list.count { it.status.equals("Pending", ignoreCase = true) }

            rootView.findViewById<TextView>(R.id.activeCountText)?.text = activeCount.toString()
            rootView.findViewById<TextView>(R.id.pendingCountText)?.text = pendingCount.toString()

            val latest = list.firstOrNull {
                it.status.equals("Approved", ignoreCase = true) ||
                        it.status.equals("Pending", ignoreCase = true)
            }

            if (latest != null) {
                val stations = SolarGridDbHelper(requireContext()).getCachedStations()
                val stationName = stations.firstOrNull { it.id == latest.stationId || it.stationCode == latest.stationId }?.hubName
                    ?: if (latest.stationId.isNotEmpty()) "Station #${latest.stationId.takeLast(6).uppercase()}" else "Solar Hub"

                rootView.findViewById<TextView>(R.id.currentReservationName)?.text = stationName
                rootView.findViewById<TextView>(R.id.currentReservationStatus)?.text = latest.status
                rootView.findViewById<TextView>(R.id.currentReservationDistance)?.text = DateUtils.toSriLankaTime(latest.scheduledDateTime)
                rootView.findViewById<TextView>(R.id.currentReservationCapacity)?.text =
                    "Allocated: ${latest.energyAmountKwH} kWh"
            } else {
                rootView.findViewById<TextView>(R.id.currentReservationName)?.text = "No Active Booking"
                rootView.findViewById<TextView>(R.id.currentReservationStatus)?.text = "None"
                rootView.findViewById<TextView>(R.id.currentReservationDistance)?.text = "Tap above to reserve a slot"
                rootView.findViewById<TextView>(R.id.currentReservationCapacity)?.text = "Allocated: 0 kWh"
            }
        }
    }
}
