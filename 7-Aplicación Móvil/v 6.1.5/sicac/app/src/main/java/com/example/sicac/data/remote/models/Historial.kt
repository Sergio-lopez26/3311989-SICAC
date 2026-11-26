package com.example.sicac.data.remote.models

import com.google.gson.annotations.SerializedName

data class PacienteItem(
    val id: Int,
    val primer_nombre: String?,
    val segundo_nombre: String?,
    val primer_apellido: String?,
    val segundo_apellido: String?,
    val numero_documento: String?,
    val tipo_sangre: String?
) {
    fun nombreCompleto(): String {
        return listOfNotNull(primer_nombre, segundo_nombre, primer_apellido, segundo_apellido)
            .filter { it.isNotBlank() && it != "null" }
            .joinToString(" ")
    }

    override fun toString(): String = "${nombreCompleto()} - Doc: ${numero_documento ?: ""}"
}

data class TipoDiagnosticoItem(
    val id: Int,
    val nombre_diagnostico: String,
    val descripcion: String? = null
) {
    override fun toString(): String = nombre_diagnostico
}

data class MedicamentoItem(
    val id: Int,
    val nombre_medicamento: String,
    val id_tipo_medicamento: Int? = null
) {
    override fun toString(): String = nombre_medicamento
}

data class TipoMedicamentoItem(
    val id: Int,
    val categoria_medicamento: String
) {
    override fun toString(): String = categoria_medicamento
}

data class PacienteIdRef(val id: Int)
data class TipoCitaRef(val id: Int, val nombre_cita: String? = null, val tipo_cita: String? = null)

data class CitaMedicoItem(
    val id: Int,
    @SerializedName(value = "id_paciente", alternate = ["paciente_id"])
    val id_paciente: Int = 0,
    val paciente: PacienteIdRef? = null,
    val id_medico: Int = 0,
    val id_tipo_cita: Int = 0,
    val tipo_cita: Any? = null,
    val fecha_cita: String? = "",
    val hora_inicio: String? = "",
    val hora_fin: String? = "",
    @SerializedName(value = "estado_cita", alternate = ["estado"])
    val estado_cita: String? = ""
) {
    fun obtenerIdPacienteReal(): Int = if (id_paciente != 0) id_paciente else (paciente?.id ?: 0)

    fun obtenerIdTipoCitaReal(): Int {
        if (id_tipo_cita != 0) return id_tipo_cita
        if (tipo_cita is Map<*, *>) {
            return (tipo_cita["id"] as? Number)?.toInt() ?: 1
        }
        return 1
    }

    private fun obtenerNombreTipoCita(): String {
        return when (tipo_cita) {
            is String -> tipo_cita
            is Map<*, *> -> (tipo_cita["nombre_cita"] ?: tipo_cita["tipo_cita"] ?: tipo_cita["nombre"] ?: "").toString()
            else -> ""
        }
    }

    override fun toString(): String {
        val fechaLimpia = (fecha_cita ?: "").split("T").firstOrNull() ?: ""
        val hIni = (hora_inicio ?: "").take(5)
        val hFin = (hora_fin ?: "").take(5)
        val nombreTipo = obtenerNombreTipoCita()
        return if (nombreTipo.isNotBlank()) "$fechaLimpia | $hIni - $hFin ($nombreTipo)" else "$fechaLimpia | $hIni - $hFin"
    }
}
data class HistorialMedicoItem(
    val id: Int,
    val id_paciente: Int? = null,
    val antecedentes_medicos: String? = ""
)

data class DiagnosticoPacienteItem(
    val id: Int,
    val motivo: String? = "",
    val observaciones: String? = "",
    val tratamiento_sugerido: String? = "",
    val fecha_registro: String? = ""
) {
    fun fechaCorta(): String = (fecha_registro ?: "").take(10)
}