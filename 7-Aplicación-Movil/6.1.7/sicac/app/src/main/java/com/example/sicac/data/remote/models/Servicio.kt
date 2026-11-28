package com.example.sicac.data.remote.models

// Campos tal como los valida/devuelve Laravel (snake_case, igual que Paciente)
data class Servicio(
    val id: Int = 0,                           // 0 al crear: Laravel lo ignora
    val id_tipo_servicio: Int,
    val id_diagnostico: Int,
    val nombre_servicio: String,               // máx. 40
    val procedimiento: String,
    val precio_aplicado: Double? = null,       // al crear lo calcula Laravel desde el tipo; al editar es obligatorio
    val fecha_servicio: String? = null,        // solo lectura
    val nombre_paciente: String? = null        // solo lectura: si el backend lo trae se muestra, si no "N/A"
)

// store, show y update devuelven el objeto dentro de "servicio"
data class ServicioResponse(
    val message: String? = null,
    val servicio: Servicio? = null,
    val status: Int? = null
)
