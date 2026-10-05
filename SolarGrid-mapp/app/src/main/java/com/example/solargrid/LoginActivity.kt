package com.example.solargrid

import android.content.Intent
import android.os.Bundle
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat



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

        // register link navigation
        val register = findViewById<TextView>(R.id.registerLink)

        register.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
        // login page link
        val login = findViewById<LinearLayout>(R.id.loginSubmitButton)

        login.setOnClickListener {
            val intent = Intent(this, ProcumerDashboard::class.java)
            startActivity(intent)
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