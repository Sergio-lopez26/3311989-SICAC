package com.example.sicac.ui

import android.app.AlertDialog
import android.content.Context
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
import com.example.sicac.data.remote.ServicioApi
import com.example.sicac.data.remote.TipoServicioApi
import com.example.sicac.data.remote.mensajeError
import com.example.sicac.data.remote.models.Servicio
import com.example.sicac.data.remote.models.TipoServicio
//Importaciones de diseño
import com.google.android.material.card.MaterialCardView
import com.google.android.material.textfield.TextInputEditText
//Corrutinas para tareas pesadas
import kotlinx.coroutines.async
import kotlinx.coroutines.launch

//Equivale a ServicioCore del frontend web.
//soloLectura (como en el React): oculta "Nuevo" y no deja abrir el formulario de edición.
//Aquí se decide por el rol guardado en la sesión: Administrador y Odontólogo (médico) crean/editan;
//cualquier otro rol queda en solo lectura.
class GestionarServicios : Fragment() {

    private val servicioApi: ServicioApi by lazy {
        RetrofitClient.getClient(requireContext()).create(ServicioApi::class.java)
    }
    private val tipoApi: TipoServicioApi by lazy {
        RetrofitClient.getClient(requireContext()).create(TipoServicioApi::class.java)
    }

    private var soloLectura = false
    private var listServicios: List<Servicio> = emptyList()
    private var tipos: List<TipoServicio> = emptyList() //Catálogo, para el select y para mostrar el nombre en la lista
    private var servicioSeleccionado: Servicio? = null  //Servicio en edición
    private var modoRegistro = false                    //true = formulario de "Nuevo"

    private lateinit var adapter: GestorServicios
    private lateinit var scrollPrincipal: NestedScrollView
    private lateinit var cardFormulario: MaterialCardView
    private lateinit var tvTituloFormulario: TextView
    private lateinit var rvServicios: RecyclerView
    private lateinit var tvSinResultados: TextView

    // Campos del formulario
    private lateinit var spTipoServicio: Spinner
    private lateinit var tvPrecioReferencia: TextView
    private lateinit var etIdDiagnostico: TextInputEditText
    private lateinit var etNombreServicio: TextInputEditText
    private lateinit var etProcedimiento: TextInputEditText
    private lateinit var llPrecioAplicado: LinearLayout
    private lateinit var etPrecioAplicado: TextInputEditText
    private lateinit var btnGuardar: Button
    private lateinit var etBusqueda: TextInputEditText

    private val textoSeleccione = "Seleccione el tipo de servicio"

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_servicios, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val prefs = requireContext().getSharedPreferences("usuario_sesion", Context.MODE_PRIVATE)
        soloLectura = prefs.getString("rol", "") !in listOf("Administrador", "Odontologo")

        enlazarVistas(view)
        configurarEventos(view)
        obtenerDatosIniciales()
    }

    private fun enlazarVistas(view: View) {
        scrollPrincipal = view.findViewById(R.id.scrollPrincipal)
        cardFormulario = view.findViewById(R.id.cardFormulario)
        tvTituloFormulario = view.findViewById(R.id.tvTituloFormulario)
        rvServicios = view.findViewById(R.id.rvServicios)
        tvSinResultados = view.findViewById(R.id.tvSinResultados)

        spTipoServicio = view.findViewById(R.id.spTipoServicio)
        tvPrecioReferencia = view.findViewById(R.id.tvPrecioReferencia)
        etIdDiagnostico = view.findViewById(R.id.etIdDiagnostico)
        etNombreServicio = view.findViewById(R.id.etNombreServicio)
        etProcedimiento = view.findViewById(R.id.etProcedimiento)
        llPrecioAplicado = view.findViewById(R.id.llPrecioAplicado)
        etPrecioAplicado = view.findViewById(R.id.etPrecioAplicado)
        btnGuardar = view.findViewById(R.id.btnGuardar)
        etBusqueda = view.findViewById(R.id.etBusquedaServicio)

        adapter = GestorServicios(emptyList(), { idTipo -> obtenerNombreTipo(idTipo) }) { servicio ->
            if (!soloLectura) eligeRegistro(servicio)
        }
        rvServicios.layoutManager = LinearLayoutManager(requireContext())
        rvServicios.adapter = adapter
    }

    private fun configurarEventos(view: View) {
        etBusqueda.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) = filtrarServicios(s.toString())
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        //Al elegir el tipo en el registro nuevo, se muestra como referencia su precio actual del catálogo
        spTipoServicio.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, v: View?, position: Int, id: Long) {
                actualizarPrecioReferencia()
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        val btnNuevo = view.findViewById<Button>(R.id.btnNuevo)
        if (soloLectura) {
            btnNuevo.visibility = View.GONE
        } else {
            btnNuevo.setOnClickListener { mostrarFormularioNuevo() }
        }
        btnGuardar.setOnClickListener { guardar() }
        view.findViewById<Button>(R.id.btnCancelar).setOnClickListener { cerrarFormulario() }
    }

    private fun obtenerDatosIniciales() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val deferredServicios = async { servicioApi.obtenerServicios() }
                val deferredTipos = async { tipoApi.obtenerTiposServicio() }

                val resServicios = deferredServicios.await()
                val resTipos = deferredTipos.await()

                //Laravel responde 404 cuando no hay registros: se trata como lista vacía
                tipos = if (resTipos.isSuccessful) resTipos.body() ?: emptyList() else emptyList()
                cargarSpinnerTipos(conPrecio = modoRegistro)
                servicioSeleccionado?.let { seleccionarTipoEnSpinner(it.id_tipo_servicio) }

                if (resServicios.isSuccessful) {
                    listServicios = resServicios.body() ?: emptyList()
                    filtrarServicios(etBusqueda.text.toString())
                } else if (resServicios.code() == 404) {
                    listServicios = emptyList()
                    filtrarServicios("")
                } else {
                    Toast.makeText(requireContext(), "Error al cargar servicios (${resServicios.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error de conexión: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    //Mismo criterio de búsqueda de ServicioCore: servicio, paciente, tipo, diagnóstico, procedimiento y precio
    private fun filtrarServicios(query: String) {
        val termino = query.lowercase().trim()
        val filtrados = if (termino.isEmpty()) listServicios else listServicios.filter { s ->
            listOf(
                s.nombre_servicio,
                s.nombre_paciente ?: "",
                obtenerNombreTipo(s.id_tipo_servicio),
                s.id_diagnostico.toString(),
                s.procedimiento,
                (s.precio_aplicado ?: "").toString()
            ).joinToString(" ").lowercase().contains(termino)
        }
        adapter.actualizarLista(filtrados)
        tvSinResultados.visibility = if (filtrados.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun obtenerNombreTipo(idTipo: Int): String {
        return tipos.find { it.id == idTipo }?.tipo_servicio ?: "—"
    }

    //Posición 0 = "Seleccione el tipo de servicio"; el tipo real está en la posición - 1
    //En el registro cada opción muestra "Tipo ($precio)", en la edición solo el nombre (como el React)
    private fun cargarSpinnerTipos(conPrecio: Boolean) {
        val etiquetas = listOf(textoSeleccione) + tipos.map { t ->
            if (conPrecio) "${t.tipo_servicio} (${formatoPrecio(t.precio_actual)})" else t.tipo_servicio
        }
        spTipoServicio.adapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_dropdown_item,
            etiquetas
        )
    }

    private fun tipoElegido(): TipoServicio? = tipos.getOrNull(spTipoServicio.selectedItemPosition - 1)

    private fun seleccionarTipoEnSpinner(idTipo: Int) {
        val pos = tipos.indexOfFirst { it.id == idTipo }
        if (pos >= 0) spTipoServicio.setSelection(pos + 1)
    }

    //Solo se muestra al registrar: al crear, Laravel toma el precio del tipo elegido
    private fun actualizarPrecioReferencia() {
        val tipo = tipoElegido()
        if (modoRegistro && tipo != null) {
            tvPrecioReferencia.text = "Precio de referencia del catálogo: ${formatoPrecio(tipo.precio_actual)}"
            tvPrecioReferencia.visibility = View.VISIBLE
        } else {
            tvPrecioReferencia.visibility = View.GONE
        }
    }

    //Al elegir una fila se muestra el formulario con sus datos (modo actualizar)
    private fun eligeRegistro(servicio: Servicio) {
        modoRegistro = false
        servicioSeleccionado = servicio
        tvTituloFormulario.text = "Editar servicio #${servicio.id}"

        cargarSpinnerTipos(conPrecio = false)
        seleccionarTipoEnSpinner(servicio.id_tipo_servicio)
        etIdDiagnostico.setText(servicio.id_diagnostico.toString())
        etNombreServicio.setText(servicio.nombre_servicio)
        etProcedimiento.setText(servicio.procedimiento)
        etPrecioAplicado.setText((servicio.precio_aplicado ?: 0.0).toString())

        llPrecioAplicado.visibility = View.VISIBLE //El precio aplicado solo se edita al actualizar
        tvPrecioReferencia.visibility = View.GONE
        btnGuardar.text = "Actualizar"
        cardFormulario.visibility = View.VISIBLE
        scrollPrincipal.smoothScrollTo(0, 0)
    }

    private fun mostrarFormularioNuevo() {
        if (tipos.isEmpty()) {
            mostrarPrecaucion("Primero debe existir al menos un tipo de servicio registrado")
            return
        }

        modoRegistro = true
        servicioSeleccionado = null
        tvTituloFormulario.text = "Nuevo servicio"
        etIdDiagnostico.setText("")
        etNombreServicio.setText("")
        etProcedimiento.setText("")
        etPrecioAplicado.setText("")

        cargarSpinnerTipos(conPrecio = true)
        spTipoServicio.setSelection(0) //Sin tipo elegido, igual que el React
        llPrecioAplicado.visibility = View.GONE
        actualizarPrecioReferencia()
        btnGuardar.text = "Registrar"
        cardFormulario.visibility = View.VISIBLE
        scrollPrincipal.smoothScrollTo(0, 0)
    }

    private fun cerrarFormulario() {
        cardFormulario.visibility = View.GONE
        servicioSeleccionado = null
        modoRegistro = false
    }

    private fun guardar() {
        val tipo = tipoElegido()
        val idDiagnostico = etIdDiagnostico.text.toString().trim().toIntOrNull()
        val nombre = etNombreServicio.text.toString().trim()
        val procedimiento = etProcedimiento.text.toString().trim()
        val actual = servicioSeleccionado

        //El procedimiento es opcional en el formulario React, pero Laravel lo exige (required)
        if (tipo == null || idDiagnostico == null || nombre.isEmpty() || procedimiento.isEmpty()) {
            mostrarPrecaucion("El tipo de servicio, el ID del diagnóstico, el nombre y el procedimiento son obligatorios")
            return
        }
        if (nombre.length > 40) {
            mostrarPrecaucion("El nombre del servicio no puede superar los 40 caracteres")
            return
        }

        //Solo al actualizar: Laravel exige el precio aplicado (numérico, mínimo 0)
        var precio: Double? = null
        if (actual != null) {
            precio = etPrecioAplicado.text.toString().trim().toDoubleOrNull()
            if (precio == null || precio < 0) {
                mostrarPrecaucion("El precio aplicado debe ser un número mayor o igual a 0")
                return
            }
        }

        val servicio = Servicio(
            id = actual?.id ?: 0,
            id_tipo_servicio = tipo.id,
            id_diagnostico = idDiagnostico,
            nombre_servicio = nombre,
            procedimiento = procedimiento,
            precio_aplicado = precio //null al registrar: Laravel lo calcula desde tipo_servicio
        )

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = if (actual == null) servicioApi.registrarServicio(servicio)
                else servicioApi.actualizarServicio(actual.id, servicio)

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
            .setTitle(if (esNuevo) "¡Registro Exitoso!" else "¡Servicio Actualizado!")
            .setMessage(
                if (esNuevo) "El servicio ha sido registrado en el sistema exitosamente."
                else "El servicio ha sido actualizado en el sistema exitosamente."
            )
            .setCancelable(false)
            .setPositiveButton("Continuar") { _, _ ->
                cerrarFormulario()
                if (esNuevo) etBusqueda.setText("") //Igual que modalRegistro del React: limpia la búsqueda
            }
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
