package com.example.sicac.data.remote.models

data class LoginResponse(
    val success: Boolean = false,
    val message: String? = null,
    val registroIncompleto: Boolean = false,
    val elegirRol: Boolean = false,
    val usuario: UsuarioData? = null,
    val usuarioReal: UsuarioMultiRolData? = null,
    val token: String = ""
)

// Para un solo rol o registro incompleto
data class UsuarioData(
    val id: Int,
    val email: String,
    val rol: String = "sin_rol",
    val nombre_completo: String = "Usuario"
)

// Para cuando el usuario tiene múltiples roles asignados
data class UsuarioMultiRolData(
    val id: Int,
    val email: String,
    val nombre_completo: String = "Usuario",
    val roles: List<String> = emptyList()
)