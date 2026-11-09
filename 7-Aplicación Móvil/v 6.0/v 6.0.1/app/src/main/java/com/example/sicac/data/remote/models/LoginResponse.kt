package com.example.sicac.data.remote.models

data class LoginResponse(
    val message: String,
    val token: String,
    val user: UserData
)

data class UserData(
    val nombreUsuarios: String,
    val codigoRol: Int,
    val documentoInstructor: String
)