package com.example.sicac.data.remote.models

data class Paciente (
    val id: Int,
    val id_usuario: Int,
    val id_tipo_documento: Int,
    val numero_documento: String,
    val email: String,
    val password: String? = "********",
    val fecha_nacimiento: String,
    val primer_nombre: String,
    val segundo_nombre: String?,
    val primer_apellido: String,
    val segundo_apellido: String?, //? se agrega porque es opcional
    val numero_celular: String,
    val tipo_sangre: String,
    val genero: String,
    val nombre_acudiente: String?,
    val documento_acudiente: String?,
    val estado_paciente: String
)

data class PacienteUpdateResponse(
    val message: String,
    val paciente: Paciente?,
    val status: Int
)