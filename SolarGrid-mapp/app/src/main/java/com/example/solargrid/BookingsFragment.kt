package com.example.solargrid

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController

class BookingsFragment : Fragment() {

    private lateinit var tabActive: TextView
    private lateinit var tabHistory: TextView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(
            R.layout.fragment_bookings,
            container,
            false
        )
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<ImageView>(R.id.backButton)?.setOnClickListener {
            findNavController().navigate(R.id.nav_home)
        }

        tabActive = view.findViewById(R.id.bookingHistoryButton)
        tabHistory = view.findViewById(R.id.pendingHistoryButton)
        val searchInput = view.findViewById<android.widget.EditText>(R.id.bookingSearchInput)

        var lastQuery = ""

        fun notifyChildQuery(query: String) {
            val curFrag = childFragmentManager.findFragmentById(R.id.historyFragmentContainer)
            if (curFrag is ActiveBookingsFragment) {
                curFrag.updateSearchQuery(query)
            } else if (curFrag is BookingHistoryFragment) {
                curFrag.updateSearchQuery(query)
            }
        }

        searchInput?.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                lastQuery = s?.toString() ?: ""
                notifyChildQuery(lastQuery)
            }
            override fun afterTextChanged(s: android.text.Editable?) {}
        })

        // Load default active bookings fragment
        if (savedInstanceState == null) {
            val activeFrag = ActiveBookingsFragment()
            childFragmentManager.beginTransaction()
                .replace(R.id.historyFragmentContainer, activeFrag)
                .commit()
        }

        tabActive.setOnClickListener {
            selectTab(true)
            val frag = ActiveBookingsFragment()
            childFragmentManager.beginTransaction()
                .replace(R.id.historyFragmentContainer, frag)
                .runOnCommit { frag.updateSearchQuery(lastQuery) }
                .commit()
        }

        tabHistory.setOnClickListener {
            selectTab(false)
            val frag = BookingHistoryFragment()
            childFragmentManager.beginTransaction()
                .replace(R.id.historyFragmentContainer, frag)
                .runOnCommit { frag.updateSearchQuery(lastQuery) }
                .commit()
        }
    }

    private fun selectTab(isActive: Boolean) {
        if (isActive) {
            tabActive.setBackgroundResource(R.drawable.history_tab_selected)
            tabActive.setTextColor(Color.WHITE)
            tabHistory.setBackgroundResource(R.drawable.history_tab_unselected)
            tabHistory.setTextColor(Color.parseColor("#B8C8C0"))
        } else {
            tabHistory.setBackgroundResource(R.drawable.history_tab_selected)
            tabHistory.setTextColor(Color.WHITE)
            tabActive.setBackgroundResource(R.drawable.history_tab_unselected)
            tabActive.setTextColor(Color.parseColor("#B8C8C0"))
        }
    }
}
