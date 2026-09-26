package com.example.solargrid

import android.content.Context

enum class Role {
    PROSUMER,
    GRID_OPERATOR
}

data class User(
    val nic: String,
    val password: String = "",
    val role: Role,
    val name: String,
    val email: String = ""
)

object UserRepository {
    fun getCurrentUser(context: Context): User? {
        val session = SolarGridDbHelper(context).getSession() ?: return null
        val roleEnum = if (session.role.equals("GridOperator", ignoreCase = true) ||
            session.role.equals("GRID_OPERATOR", ignoreCase = true)) {
            Role.GRID_OPERATOR
        } else {
            Role.PROSUMER
        }
        return User(
            nic = session.nic,
            role = roleEnum,
            name = session.name,
            email = session.email
        )
    }

    fun logout(context: Context) {
        SolarGridDbHelper(context).clearSession()
    }
}
