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
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private var touchStartX = 0f
    private var touchStartY = 0f

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_login)

        val rootView = findViewById<android.view.View>(R.id.main)
        val scrollView = findViewById<ScrollView>(R.id.loginScrollView)

        ViewCompat.setOnApplyWindowInsetsListener(rootView) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, 0)
            scrollView.setPadding(0, 0, 0, maxOf(ime.bottom, systemBars.bottom))
            insets
        }

        // Allow changing server IP by long-clicking the title or header
        findViewById<android.view.View>(R.id.loginTitle)?.setOnLongClickListener {
            showServerConfigDialog()
            true
        }

        // Register link navigation
        val register = findViewById<TextView>(R.id.registerLink)
        register.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }

        // Login form
        val loginButton = findViewById<LinearLayout>(R.id.loginSubmitButton)
        val nicInput = findViewById<EditText>(R.id.nicInput)
        val passwordInput = findViewById<EditText>(R.id.passwordInput)
        val togglePassword = findViewById<TextView>(R.id.togglePassword)
        var isPasswordVisible = false

        togglePassword.setOnClickListener {
            isPasswordVisible = !isPasswordVisible
            val selection = passwordInput.selectionEnd
            if (isPasswordVisible) {
                passwordInput.transformationMethod = android.text.method.HideReturnsTransformationMethod.getInstance()
                togglePassword.text = "Hide"
            } else {
                passwordInput.transformationMethod = android.text.method.PasswordTransformationMethod.getInstance()
                togglePassword.text = "Show"
            }
            passwordInput.setSelection(selection.coerceIn(0, passwordInput.text?.length ?: 0))
        }

        loginButton.setOnClickListener {
            val nic = nicInput.text.toString().trim()
            val password = passwordInput.text.toString()

            if (nic.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter NIC and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            loginButton.isEnabled = false
            Toast.makeText(this, "Signing in...", Toast.LENGTH_SHORT).show()

            lifecycleScope.launch {
                val result = ApiClient.login(this@LoginActivity, nic, password)
                loginButton.isEnabled = true

                if (result.isSuccess) {
                    val auth = result.getOrThrow()
                    Toast.makeText(this@LoginActivity, "Welcome, ${auth.fullName}!", Toast.LENGTH_SHORT).show()

                    val intent = if (auth.role.equals("GridOperator", ignoreCase = true) ||
                        auth.role.equals("GRID_OPERATOR", ignoreCase = true)) {
                        Intent(this@LoginActivity, GridOperatorDashboard::class.java)
                    } else {
                        Intent(this@LoginActivity, ProcumerDashboard::class.java)
                    }
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                } else {
                    val error = result.exceptionOrNull()?.message
                        ?: "Invalid credentials. Please verify your NIC and password."
                    Toast.makeText(this@LoginActivity, error, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun showServerConfigDialog() {
        val currentUrl = ApiConfig.getBaseUrl(this)
        val input = EditText(this).apply {
            setText(currentUrl)
            setSelection(currentUrl.length)
        }

        AlertDialog.Builder(this)
            .setTitle("API Server URL")
            .setMessage("Set Web API Base URL (use PC IP on private Wi-Fi):")
            .setView(input)
            .setPositiveButton("Save") { _, _ ->
                val newUrl = input.text.toString().trim()
                if (newUrl.isNotEmpty()) {
                    ApiConfig.setBaseUrl(this, newUrl)
                    Toast.makeText(this, "Saved: $newUrl", Toast.LENGTH_SHORT).show()
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
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