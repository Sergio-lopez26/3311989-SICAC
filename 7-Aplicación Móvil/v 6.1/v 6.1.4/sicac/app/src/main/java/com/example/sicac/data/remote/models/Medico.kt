package com.example.sicac.data.remote.models

data class Medico (
    val id: Int,
    val id_usuario: Int,
    val id_tipo_documento: Int,
    val numero_documento: String,
    val email: String,
    val password: String? = "********",
    val nombres: String,
    val apellidos: String,
    val matricula_profesional: String,
    val numero_celular: String,
    val fecha_registro: String,
    val estado_medico: String
)

data class MedicoUpdateResponse(
    val message: String,
    val medico: Medico?,
    val status: Int
)