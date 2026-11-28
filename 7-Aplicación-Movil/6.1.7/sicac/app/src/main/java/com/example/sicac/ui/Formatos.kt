package com.example.sicac.ui

import java.util.Locale

// Precio en pesos colombianos: 50000.0 -> "$50.000"
fun formatoPrecio(valor: Double?): String =
    String.format(Locale("es", "CO"), "\$%,.0f", valor ?: 0.0)
