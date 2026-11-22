package com.example.sicac.data.remote.models

data class TipoDocumento (
    val id: Int,
    val sigla: String,
    val nombre_documento: String
) {
    override fun toString(): String {
        return "$sigla - $nombre_documento"
    }
}