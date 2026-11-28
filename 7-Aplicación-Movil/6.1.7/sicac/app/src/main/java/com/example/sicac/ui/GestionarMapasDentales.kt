package com.example.sicac.ui

import android.app.AlertDialog
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.core.os.bundleOf
import androidx.core.widget.NestedScrollView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.sicac.R
//Importanciones propias del proyecto
import com.example.sicac.data.remote.MapaDentalApi
import com.example.sicac.data.remote.RetrofitClient
import com.example.sicac.data.remote.mensajeError
import com.example.sicac.data.remote.models.MapaDental
//Importaciones de diseño
import com.google.android.material.card.MaterialCardView
import com.google.android.material.textfield.TextInputEditText
//Corrutinas para tareas pesadas
import kotlinx.coroutines.launch

class GestionarMapasDentales : Fragment() {

    private val apiService: MapaDentalApi by lazy {
        RetrofitClient.getClient(requireContext()).create(MapaDentalApi::class.java)
    }

    private var listMapas: List<MapaDental> = emptyList()
    private var mapaSeleccionado: MapaDental? = null //null = formulario en modo "registrar"

    private lateinit var adapter: GestorMapasDentales
    private lateinit var scrollPrincipal: NestedScrollView
    private lateinit var cardFormulario: MaterialCardView
    private lateinit var tvTituloFormulario: TextView
    private lateinit var rvMapas: RecyclerView
    private lateinit var tvSinResultados: TextView

    // Campos del formulario
    private lateinit var etIdHistorial: TextInputEditText
    private lateinit var etNombreEstandar: TextInputEditText
    private lateinit var etObservacion: TextInputEditText
    private lateinit var spEstadoMapa: Spinner
    private lateinit var btnGuardar: Button
    private lateinit var etBusqueda: TextInputEditText

    private val opcionesEstado = listOf("Activo", "Inactivo")

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_mapas_dentales, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        enlazarVistas(view)
        spEstadoMapa.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, opcionesEstado)
        configurarEventos(view)
        obtenerDatosIniciales()
    }

    private fun enlazarVistas(view: View) {
        scrollPrincipal = view.findViewById(R.id.scrollPrincipal)
        cardFormulario = view.findViewById(R.id.cardFormulario)
        tvTituloFormulario = view.findViewById(R.id.tvTituloFormulario)
        rvMapas = view.findViewById(R.id.rvMapas)
        tvSinResultados = view.findViewById(R.id.tvSinResultados)

        etIdHistorial = view.findViewById(R.id.etIdHistorial)
        etNombreEstandar = view.findViewById(R.id.etNombreEstandar)
        etObservacion = view.findViewById(R.id.etObservacion)
        spEstadoMapa = view.findViewById(R.id.spEstadoMapa)
        btnGuardar = view.findViewById(R.id.btnGuardar)
        etBusqueda = view.findViewById(R.id.etBusquedaMapa)

        adapter = GestorMapasDentales(
            emptyList(),
            { mapa -> eligeRegistro(mapa) },
            { mapa -> irAOdontograma(mapa) }
        )
        rvMapas.layoutManager = LinearLayoutManager(requireContext())
        rvMapas.adapter = adapter
    }

    private fun configurarEventos(view: View) {
        etBusqueda.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) = filtrarMapas(s.toString())
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
                val res = apiService.obtenerMapas()

                if (res.isSuccessful) {
                    listMapas = res.body() ?: emptyList()
                    filtrarMapas(etBusqueda.text.toString())
                } else if (res.code() == 404) {
                    //Laravel responde 404 cuando no hay mapas registrados
                    listMapas = emptyList()
                    filtrarMapas("")
                } else {
                    Toast.makeText(requireContext(), "Error al cargar mapas dentales (${res.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error de conexión: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun filtrarMapas(query: String) {
        val termino = query.lowercase().trim()
        val filtrados = listMapas.filter { m ->
            m.nombre_estandar.lowercase().contains(termino) ||
                m.estado_mapa_dental.lowercase().contains(termino) ||
                m.id.toString().contains(termino) ||
                m.id_historial_medico.toString().contains(termino)
        }
        adapter.actualizarLista(filtrados)
        tvSinResultados.visibility = if (filtrados.isEmpty()) View.VISIBLE else View.GONE
    }

    //Al elegir una fila se muestra el formulario con sus datos (modo actualizar)
    private fun eligeRegistro(mapa: MapaDental) {
        mapaSeleccionado = mapa
        tvTituloFormulario.text = "Editar mapa dental #${mapa.id}"
        etIdHistorial.setText(mapa.id_historial_medico.toString())
        etNombreEstandar.setText(mapa.nombre_estandar)
        etObservacion.setText(mapa.observacion_inicial ?: "")

        val posEstado = opcionesEstado.indexOf(mapa.estado_mapa_dental)
        if (posEstado >= 0) spEstadoMapa.setSelection(posEstado)

        btnGuardar.text = "Actualizar"
        cardFormulario.visibility = View.VISIBLE
        scrollPrincipal.smoothScrollTo(0, 0)
    }

    private fun mostrarFormularioNuevo() {
        mapaSeleccionado = null
        tvTituloFormulario.text = "Nuevo mapa dental"
        etIdHistorial.setText("")
        etNombreEstandar.setText("")
        etObservacion.setText("")
        spEstadoMapa.setSelection(0) //"Activo" por defecto
        btnGuardar.text = "Registrar"
        cardFormulario.visibility = View.VISIBLE
        scrollPrincipal.smoothScrollTo(0, 0)
    }

    private fun cerrarFormulario() {
        cardFormulario.visibility = View.GONE
        mapaSeleccionado = null
    }

    private fun guardar() {
        val idHistorial = etIdHistorial.text.toString().trim().toIntOrNull()
        val nombre = etNombreEstandar.text.toString().trim()

        if (idHistorial == null || nombre.isEmpty()) {
            mostrarPrecaucion("El ID del historial médico y el nombre estándar son obligatorios")
            return
        }
        if (nombre.length > 40) {
            mostrarPrecaucion("El nombre estándar no puede superar los 40 caracteres")
            return
        }

        val actual = mapaSeleccionado
        val mapa = MapaDental(
            id = actual?.id ?: 0,
            id_historial_medico = idHistorial,
            nombre_estandar = nombre,
            observacion_inicial = etObservacion.text.toString().trim().ifEmpty { null },
            estado_mapa_dental = spEstadoMapa.selectedItem.toString()
        )

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = if (actual == null) apiService.registrarMapa(mapa)
                else apiService.actualizarMapa(actual.id, mapa)

                if (res.isSuccessful) {
                    obtenerDatosIniciales()
                    mostrarExito(esNuevo = actual == null)
                } else {
                    Toast.makeText(requireContext(), res.mensajeError(), Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error en el servidor: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun mostrarExito(esNuevo: Boolean) {
        AlertDialog.Builder(requireContext())
            .setTitle(if (esNuevo) "¡Registro Exitoso!" else "¡Mapa Dental Actualizado!")
            .setMessage(
                if (esNuevo) "El mapa dental ha sido registrado en el sistema exitosamente."
                else "El mapa dental ha sido actualizado en el sistema exitosamente."
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

    //Navega al odontograma del mapa elegido (destino definido en el nav graph)
    private fun irAOdontograma(mapa: MapaDental) {
        findNavController().navigate(
            R.id.gestionarOdontograma,
            bundleOf("idMapa" to mapa.id, "nombreMapa" to mapa.nombre_estandar)
        )
    }
}
