package com.example.sicac.data.remote.models

// Campos tal como los valida/devuelve Laravel (snake_case, igual que Paciente)
data class MapaDental(
    val id: Int = 0,                           // 0 al crear: Laravel lo ignora
    val id_historial_medico: Int,
    val nombre_estandar: String,               // máx. 40
    val observacion_inicial: String? = null,
    val fecha_registro: String? = null,        // solo lectura
    val estado_mapa_dental: String             // máx. 20: "Activo" / "Inactivo"
)

// store, show y update devuelven el objeto dentro de "mapa_dental"
data class MapaDentalResponse(
    val message: String? = null,
    val mapa_dental: MapaDental? = null,
    val status: Int? = null
)
