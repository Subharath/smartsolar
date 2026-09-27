package com.example.solargrid

import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import kotlinx.coroutines.launch

class ProfileFragment : Fragment() {

    private lateinit var profileNameText: TextView
    private lateinit var profileEmailText: TextView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_profile, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<ImageView>(R.id.backButton)?.setOnClickListener {
            if (!findNavController().popBackStack()) {
                try {
                    findNavController().navigate(R.id.nav_home)
                } catch (_: Exception) {
                    try {
                        findNavController().navigate(R.id.nav_grid_operator_home)
                    } catch (_: Exception) {}
                }
            }
        }

        profileNameText = view.findViewById(R.id.profileNameText)
        profileEmailText = view.findViewById(R.id.profileEmailText)

        // Load cached session first
        val session = SolarGridDbHelper(requireContext()).getSession()
        if (session != null) {
            profileNameText.text = session.name
            profileEmailText.text = "${session.role} • ${session.nic}"
        }

        // Fetch fresh profile from Web API
        fetchProfileFromApi()

        // Edit Profile Modal
        view.findViewById<TextView>(R.id.editProfileButton)?.setOnClickListener {
            showEditProfileDialog()
        }

        // Logout
        view.findViewById<TextView>(R.id.logoutButton)?.setOnClickListener {
            UserRepository.logout(requireContext())
            Toast.makeText(requireContext(), "Logged out successfully", Toast.LENGTH_SHORT).show()
            val intent = Intent(requireContext(), LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }

        // Deactivate Account Modal
        view.findViewById<TextView>(R.id.deactivateAccountButton)?.setOnClickListener {
            showDeactivateDialog()
        }
    }

    private fun fetchProfileFromApi() {
        viewLifecycleOwner.lifecycleScope.launch {
            val result = ApiClient.getProfile(requireContext())
            if (result.isSuccess) {
                val profile = result.getOrThrow()
                profileNameText.text = profile.fullName
                profileEmailText.text = "${profile.email} (${profile.nic})"
            }
        }
    }

    private fun showEditProfileDialog() {
        val dialog = Dialog(requireContext())
        dialog.setContentView(R.layout.dialog_edit_profile)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        dialog.window?.setGravity(Gravity.CENTER)

        val nameInput = dialog.findViewById<EditText>(R.id.editNameInput)
        val emailInput = dialog.findViewById<EditText>(R.id.editEmailInput)
        val saveButton = dialog.findViewById<TextView>(R.id.saveButton)
        val cancelButton = dialog.findViewById<TextView>(R.id.cancelButton)

        val session = SolarGridDbHelper(requireContext()).getSession()
        nameInput.setText(session?.name ?: "")
        emailInput.setText(session?.email ?: "")

        saveButton.setOnClickListener {
            val newName = nameInput.text.toString().trim()
            val newEmail = emailInput.text.toString().trim()

            if (newName.isEmpty()) {
                Toast.makeText(requireContext(), "Please enter a valid name", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            viewLifecycleOwner.lifecycleScope.launch {
                val updateRes = ApiClient.updateProfile(requireContext(), newName, newEmail)
                if (updateRes.isSuccess) {
                    Toast.makeText(requireContext(), "Profile updated successfully!", Toast.LENGTH_SHORT).show()
                    profileNameText.text = newName
                    if (newEmail.isNotEmpty()) profileEmailText.text = newEmail
                    dialog.dismiss()
                } else {
                    val err = updateRes.exceptionOrNull()?.message ?: "Update failed"
                    Toast.makeText(requireContext(), err, Toast.LENGTH_LONG).show()
                }
            }
        }

        cancelButton.setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
        dialog.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.88).toInt().coerceAtMost((400 * resources.displayMetrics.density).toInt()),
            WindowManager.LayoutParams.WRAP_CONTENT
        )
    }

    private fun showDeactivateDialog() {
        val dialog = Dialog(requireContext())
        dialog.setContentView(R.layout.dialog_deactivate_account)
        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        dialog.window?.setGravity(Gravity.CENTER)

        val confirmButton = dialog.findViewById<TextView>(R.id.confirmDeactivateButton)
        val cancelButton = dialog.findViewById<TextView>(R.id.cancelDeactivateButton)

        confirmButton.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                val deactRes = ApiClient.deactivateAccount(requireContext())
                if (deactRes.isSuccess) {
                    Toast.makeText(requireContext(), "Account deactivated successfully.", Toast.LENGTH_LONG).show()
                    dialog.dismiss()
                    val intent = Intent(requireContext(), LoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                } else {
                    val err = deactRes.exceptionOrNull()?.message ?: "Deactivation failed"
                    Toast.makeText(requireContext(), err, Toast.LENGTH_LONG).show()
                }
            }
        }

        cancelButton.setOnClickListener {
            dialog.dismiss()
        }

        dialog.show()
        dialog.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.88).toInt().coerceAtMost((400 * resources.displayMetrics.density).toInt()),
            WindowManager.LayoutParams.WRAP_CONTENT
        )
    }
}
