package com.example.solargrid

import android.content.Intent
import android.os.Bundle
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {

    private var touchStartX = 0f
    private var touchStartY = 0f

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_register)

        val rootView = findViewById<android.view.View>(R.id.main)
        val scrollView = findViewById<ScrollView>(R.id.registerScrollView)

        ViewCompat.setOnApplyWindowInsetsListener(rootView) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, 0)
            scrollView.setPadding(0, 0, 0, maxOf(ime.bottom, systemBars.bottom))
            insets
        }

        val registerSubmitButton = findViewById<LinearLayout>(R.id.registerSubmitButton)
        val nameInput = findViewById<EditText>(R.id.nameInput)
        val nicInput = findViewById<EditText>(R.id.nicInput)
        val emailInput = findViewById<EditText>(R.id.emailInput)
        val passwordInput = findViewById<EditText>(R.id.passwordInput)
        val confirmPasswordInput = findViewById<EditText>(R.id.confirmPasswordInput)

        registerSubmitButton.setOnClickListener {
            val name = nameInput.text.toString().trim()
            val nic = nicInput.text.toString().trim()
            val email = emailInput?.text?.toString()?.trim() ?: "${nic.lowercase()}@solargrid.lk"
            val password = passwordInput.text.toString()
            val confirmPassword = confirmPasswordInput.text.toString()

            if (name.isEmpty() || nic.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill in all required fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            registerSubmitButton.isEnabled = false
            Toast.makeText(this, "Registering account...", Toast.LENGTH_SHORT).show()

            lifecycleScope.launch {
                val result = ApiClient.register(
                    context = this@RegisterActivity,
                    nic = nic,
                    name = name,
                    email = if (email.isNotEmpty()) email else "${nic.lowercase()}@solargrid.lk",
                    pass = password,
                    role = "Prosumer"
                )
                registerSubmitButton.isEnabled = true

                if (result.isSuccess) {
                    Toast.makeText(this@RegisterActivity, "Registration successful! Please login.", Toast.LENGTH_LONG).show()
                    val intent = Intent(this@RegisterActivity, LoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                } else {
                    val error = result.exceptionOrNull()?.message ?: "Registration failed."
                    Toast.makeText(this@RegisterActivity, error, Toast.LENGTH_LONG).show()
                }
            }
        }

        // Login form link
        val loginLink = findViewById<TextView>(R.id.loginLink)
        loginLink.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            startActivity(intent)
            finish()
        }
    }

    override fun dispatchTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                touchStartX = event.rawX
                touchStartY = event.rawY
            }
            MotionEvent.ACTION_UP -> {
                val deltaX = Math.abs(event.rawX - touchStartX)
                val deltaY = Math.abs(event.rawY - touchStartY)
                val threshold = 10 * resources.displayMetrics.density

                if (deltaX < threshold && deltaY < threshold) {
                    val focused = currentFocus
                    if (focused is EditText) {
                        val rect = android.graphics.Rect()
                        focused.getGlobalVisibleRect(rect)
                        if (!rect.contains(event.rawX.toInt(), event.rawY.toInt())) {
                            focused.clearFocus()
                            val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
                            imm.hideSoftInputFromWindow(focused.windowToken, 0)
                        }
                    }
                }
            }
        }
        return super.dispatchTouchEvent(event)
    }
}