package com.example.solargrid

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.fragment.app.Fragment

class HomeFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(
            R.layout.fragment_home,
            container,
            false
        )
    }
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val bookEnergyButton =
            view.findViewById<LinearLayout>(R.id.bookEnergyButton)

        bookEnergyButton.setOnClickListener {
            val intent = Intent(
                requireContext(),
                PowerStationSelection::class.java
            )
            startActivity(intent)
        }
    }
}
