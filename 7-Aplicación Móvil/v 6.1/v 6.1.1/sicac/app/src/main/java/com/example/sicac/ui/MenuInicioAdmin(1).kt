package com.example.sicac.ui

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.example.sicac.R

class MenuInicioAdmin:  Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.inicio_admin, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val tvBienvenida = view.findViewById<TextView>(R.id.tvBienvenidoAdmin)

        //Con esto capturamos el Usuario del LoginResponse que contiene los datos de quien se loguea
        val prefs = requireActivity().getSharedPreferences("usuario_sesion", Context.MODE_PRIVATE)
        val nombreCompleto = prefs.getString("nombre_completo", "Usuario")

        tvBienvenida.text = "Bienvenido a SICAC, $nombreCompleto"
    }
}
