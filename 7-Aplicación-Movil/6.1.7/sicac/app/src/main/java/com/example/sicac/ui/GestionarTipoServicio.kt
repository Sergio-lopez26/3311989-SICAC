package com.example.sicac.ui

import android.app.AlertDialog
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.core.widget.NestedScrollView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.sicac.R
//Importanciones propias del proyecto
import com.example.sicac.data.remote.RetrofitClient
import com.example.sicac.data.remote.TipoServicioApi
import com.example.sicac.data.remote.mensajeError
import com.example.sicac.data.remote.models.TipoServicio
//Importaciones de diseño
import com.google.android.material.card.MaterialCardView
import com.google.android.material.textfield.TextInputEditText
//Corrutinas para tareas pesadas
import kotlinx.coroutines.launch

class GestionarTipoServicio : Fragment() {

    private val apiService: TipoServicioApi by lazy {
        RetrofitClient.getClient(requireContext()).create(TipoServicioApi::class.java)
    }

    private var listTipos: List<TipoServicio> = emptyList()
    private var tipoSeleccionado: TipoServicio? = null //null = formulario en modo "registrar"

    private lateinit var adapter: GestorTiposServicio
    private lateinit var scrollPrincipal: NestedScrollView
    private lateinit var cardFormulario: MaterialCardView
    private lateinit var tvTituloFormulario: TextView
    private lateinit var rvTiposServicio: RecyclerView
    private lateinit var tvSinResultados: TextView

    // Campos del formulario
    private lateinit var etTipoServicio: TextInputEditText
    private lateinit var etDescripcion: TextInputEditText
    private lateinit var etPrecioActual: TextInputEditText
    private lateinit var btnGuardar: Button
    private lateinit var etBusqueda: TextInputEditText

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_t_servicio, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        enlazarVistas(view)
        configurarEventos(view)
        obtenerDatosIniciales()
    }

    private fun enlazarVistas(view: View) {
        scrollPrincipal = view.findViewById(R.id.scrollPrincipal)
        cardFormulario = view.findViewById(R.id.cardFormulario)
        tvTituloFormulario = view.findViewById(R.id.tvTituloFormulario)
        rvTiposServicio = view.findViewById(R.id.rvTiposServicio)
        tvSinResultados = view.findViewById(R.id.tvSinResultados)

        etTipoServicio = view.findViewById(R.id.etTipoServicio)
        etDescripcion = view.findViewById(R.id.etDescripcion)
        etPrecioActual = view.findViewById(R.id.etPrecioActual)
        btnGuardar = view.findViewById(R.id.btnGuardar)
        etBusqueda = view.findViewById(R.id.etBusquedaTipo)

        adapter = GestorTiposServicio(emptyList()) { tipo -> eligeRegistro(tipo) }
        rvTiposServicio.layoutManager = LinearLayoutManager(requireContext())
        rvTiposServicio.adapter = adapter
    }

    private fun configurarEventos(view: View) {
        etBusqueda.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) = filtrarTipos(s.toString())
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        view.findViewById<Button>(R.id.btnNuevo).setOnClickListener { mostrarFormularioNuevo() }
        btnGuardar.setOnClickListener { guardar() }
        view.findViewById<Button>(R.id.btnCancelar).setOnClickListener { cerrarFormulario() }
    }

    private fun obtenerDatosIniciales() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = apiService.obtenerTiposServicio()

                if (res.isSuccessful) {
                    listTipos = res.body() ?: emptyList()
                    filtrarTipos(etBusqueda.text.toString())
                } else if (res.code() == 404) {
                    //Laravel responde 404 cuando no hay tipos registrados
                    listTipos = emptyList()
                    filtrarTipos("")
                } else {
                    Toast.makeText(requireContext(), "Error al cargar tipos de servicio (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error de conexión: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun filtrarTipos(query: String) {
        val termino = query.lowercase().trim()
        val filtrados = listTipos.filter { t ->
            t.tipo_servicio.lowercase().contains(termino) ||
                t.descripcion.lowercase().contains(termino) ||
                t.id.toString().contains(termino)
        }
        adapter.actualizarLista(filtrados)
        tvSinResultados.visibility = if (filtrados.isEmpty()) View.VISIBLE else View.GONE
    }

    //Al elegir una fila se muestra el formulario con sus datos (modo actualizar)
    private fun eligeRegistro(tipo: TipoServicio) {
        tipoSeleccionado = tipo
        tvTituloFormulario.text = "Editar tipo de servicio #${tipo.id}"
        etTipoServicio.setText(tipo.tipo_servicio)
        etDescripcion.setText(tipo.descripcion)
        etPrecioActual.setText(tipo.precio_actual.toString())

        btnGuardar.text = "Actualizar"
        cardFormulario.visibility = View.VISIBLE
        scrollPrincipal.smoothScrollTo(0, 0)
    }

    private fun mostrarFormularioNuevo() {
        tipoSeleccionado = null
        tvTituloFormulario.text = "Nuevo tipo de servicio"
        etTipoServicio.setText("")
        etDescripcion.setText("")
        etPrecioActual.setText("")
        btnGuardar.text = "Registrar"
        cardFormulario.visibility = View.VISIBLE
        scrollPrincipal.smoothScrollTo(0, 0)
    }

    private fun cerrarFormulario() {
        cardFormulario.visibility = View.GONE
        tipoSeleccionado = null
    }

    private fun guardar() {
        val nombre = etTipoServicio.text.toString().trim()
        val descripcion = etDescripcion.text.toString().trim()
        val precio = etPrecioActual.text.toString().trim().toDoubleOrNull()

        if (nombre.isEmpty() || descripcion.isEmpty() || precio == null) {
            mostrarPrecaucion("El nombre, la descripción y el precio son obligatorios")
            return
        }
        if (nombre.length > 40) {
            mostrarPrecaucion("El nombre del tipo de servicio no puede superar los 40 caracteres")
            return
        }
        if (precio < 0) {
            mostrarPrecaucion("El precio no puede ser negativo")
            return
        }

        val actual = tipoSeleccionado
        val tipo = TipoServicio(
            id = actual?.id ?: 0,
            tipo_servicio = nombre,
            descripcion = descripcion,
            precio_actual = precio
        )

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = if (actual == null) apiService.registrarTipoServicio(tipo)
                else apiService.actualizarTipoServicio(actual.id, tipo)

                if (res.isSuccessful) {
                    obtenerDatosIniciales()
                    mostrarExito(esNuevo = actual == null)
                } else {
                    //Incluye el caso de nombre repetido (campo único en Laravel)
                    Toast.makeText(requireContext(), res.mensajeError(), Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error en el servidor: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun mostrarExito(esNuevo: Boolean) {
        AlertDialog.Builder(requireContext())
            .setTitle(if (esNuevo) "¡Registro Exitoso!" else "¡Tipo de Servicio Actualizado!")
            .setMessage(
                if (esNuevo) "El tipo de servicio ha sido registrado en el sistema exitosamente."
                else "El tipo de servicio ha sido actualizado en el sistema exitosamente."
            )
            .setCancelable(false)
            .setPositiveButton("Continuar") { _, _ -> cerrarFormulario() }
            .show()
    }

    private fun mostrarPrecaucion(mensaje: String) {
        AlertDialog.Builder(requireContext())
            .setTitle("¡Precaución!")
            .setMessage(mensaje)
            .setPositiveButton("Aceptar", null)
            .show()
    }
}
