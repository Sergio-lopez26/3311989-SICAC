package com.example.sicac.data.remote.models

data class TipoServicio(
    val id: Int = 0,
    val tipo_servicio: String,                 // máx. 40, único
    val descripcion: String,
    val precio_actual: Double                  // >= 0
) {
    //Para que el Spinner muestre el nombre del tipo
    override fun toString(): String = tipo_servicio
}

data class TipoServicioResponse(
    val message: String? = null,
    val tipo_servicio: TipoServicio? = null,
    val status: Int? = null
)
