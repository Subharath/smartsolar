package com.example.solargrid

import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import kotlinx.coroutines.launch

class GridOperatorHomeFragment : Fragment() {

    // Register Activity Result Launcher for ZXing QR Scanner
    private val qrScannerLauncher = registerForActivityResult(ScanContract()) { result ->
        if (result.contents != null) {
            val qrToken = result.contents
            finalizeEnergyTransfer(qrToken)
        } else {
            Toast.makeText(requireContext(), "QR Scan cancelled", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(
            R.layout.fragment_grid_operator_home,
            container,
            false
        )
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Nearby Stations Button -> Navigates to Grid Operator Power Station Selection Map
        view.findViewById<View>(R.id.nearbyStationsButton)?.setOnClickListener {
            val intent = Intent(requireContext(), GridOperatorPowerStationSelection::class.java)
            startActivity(intent)
        }

        // Scan QR Code Button -> Opens Camera QR Scanner
        view.findViewById<View>(R.id.scanQrButton)?.setOnClickListener {
            startQrScanner()
        }
    }

    private fun startQrScanner() {
        val options = ScanOptions().apply {
            setDesiredBarcodeFormats(ScanOptions.QR_CODE)
            setPrompt("Scan Prosumer Energy Transfer QR Code")
            setCameraId(0)
            setBeepEnabled(true)
            setBarcodeImageEnabled(false)
            setOrientationLocked(true)
            setCaptureActivity(CaptureActivityPortrait::class.java)
        }
        qrScannerLauncher.launch(options)
    }

    /** Sends qrToken to POST /api/reservations/finalize-transfer and displays verification dialog */
    private fun finalizeEnergyTransfer(qrToken: String) {
        Toast.makeText(requireContext(), "Verifying QR token with SmartSolar Grid...", Toast.LENGTH_SHORT).show()

        viewLifecycleOwner.lifecycleScope.launch {
            val result = ApiClient.finalizeTransfer(requireContext(), qrToken)

            if (result.isSuccess) {
                val dialog = Dialog(requireContext())
                dialog.setContentView(R.layout.dialog_transfer_success)
                dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
                dialog.window?.setGravity(Gravity.CENTER)

                val scannedTokenText = dialog.findViewById<TextView>(R.id.scannedTokenText)
                val closeBtn = dialog.findViewById<View>(R.id.closeTransferDialogButton)

                scannedTokenText.text = qrToken

                closeBtn.setOnClickListener {
                    dialog.dismiss()
                }

                dialog.show()
                dialog.window?.setLayout(
                    (320 * resources.displayMetrics.density).toInt(),
                    WindowManager.LayoutParams.WRAP_CONTENT
                )
            } else {
                val errorMsg = result.exceptionOrNull()?.message
                    ?: "Invalid or already completed QR code."
                Toast.makeText(requireContext(), "Verification failed: $errorMsg", Toast.LENGTH_LONG).show()
            }
        }
    }
}
