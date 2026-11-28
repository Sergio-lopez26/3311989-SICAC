package com.example.sicac.data.remote.models

data class PiezaDental(
    val id: Int = 0,
    val id_mapa: Int,
    val nomenclatura_fdi: String,              // máx. 10, ej. "18"
    val cuadrante: Int,                        // fdi / 10
    val posicion: Int,                         // fdi % 10
    val estado_inicial: String? = null,        // máx. 40
    val estado_actual: String? = null          // máx. 30
)

data class PiezaDentalResponse(
    val message: String? = null,
    val pieza_dental: PiezaDental? = null,
    val status: Int? = null
)

// porMapa devuelve {"piezas_dentales": [...], "status": 200}
data class PiezasPorMapaResponse(
    val piezas_dentales: List<PiezaDental> = emptyList(),
    val status: Int? = null
)
