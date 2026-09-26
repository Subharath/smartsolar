package com.example.solargrid

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.widget.LinearLayout
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {
    @SuppressLint("WrongViewCast", "MissingInflatedId")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Auto-navigate if session already exists
        val session = SolarGridDbHelper(this).getSession()
        if (session != null && session.token.isNotEmpty()) {
            val intent = if (session.role.equals("GridOperator", ignoreCase = true) ||
                session.role.equals("GRID_OPERATOR", ignoreCase = true)) {
                Intent(this, GridOperatorDashboard::class.java)
            } else {
                Intent(this, ProcumerDashboard::class.java)
            }
            startActivity(intent)
            finish()
            return
        }

        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Login button navigation
        findViewById<LinearLayout>(R.id.loginButton)?.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        // Register button navigation
        findViewById<LinearLayout>(R.id.registerButton)?.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}