package com.example.sicac.ui

import android.app.AlertDialog
import android.app.DatePickerDialog
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
import com.example.sicac.data.remote.models.Paciente
import com.example.sicac.data.remote.models.TipoDocumento
import com.example.sicac.data.remote.PacienteApi
import com.example.sicac.data.remote.RetrofitClient
//Importaciones de diseño
import com.google.android.material.card.MaterialCardView
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
//Corrutinas para tareas pesadas
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
//Importaciones nativas
import java.util.Calendar
import java.util.Locale
class GestionarPacientes : Fragment() {

    private val apiService: PacienteApi by lazy {
        RetrofitClient.getClient(requireContext()).create(PacienteApi::class.java)
    }

    private var listPacientes: List<Paciente> = emptyList()
    private var tiposDoc: List<TipoDocumento> = emptyList()
    private var pacienteSeleccionado: Paciente? = null

    private lateinit var adapter: GestorPacientes
    private lateinit var scrollPrincipal: NestedScrollView
    private lateinit var cardFormulario: MaterialCardView
    private lateinit var rvPacientes: RecyclerView
    private lateinit var tvSinResultados: TextView

    // Campos del formulario
    private lateinit var spTipoDocumento: Spinner
    private lateinit var etNumeroDocumento: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var tilPassword: TextInputLayout
    private lateinit var etPassword: TextInputEditText
    private lateinit var etPrimerNombre: TextInputEditText
    private lateinit var etSegundoNombre: TextInputEditText
    private lateinit var etPrimerApellido: TextInputEditText
    private lateinit var etSegundoApellido: TextInputEditText
    private lateinit var etFechaNacimiento: TextInputEditText
    private lateinit var etNumeroCelular: TextInputEditText
    private lateinit var spTipoSangre: Spinner
    private lateinit var spGenero: Spinner
    private lateinit var etNombreAcudiente: TextInputEditText
    private lateinit var etDocumentoAcudiente: TextInputEditText
    private lateinit var spEstadoPaciente: Spinner
    private lateinit var etBusqueda: TextInputEditText

    private val opcionesSangre = listOf("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+")
    private val opcionesGenero = listOf("Femenino", "Masculino")
    private val opcionesEstado = listOf("Activo", "Inactivo")

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_pacientes, container, false)
    }
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        enlazarVistas(view)
        configurarSpinnersFijos()
        configurarEventos(view)
        obtenerDatosIniciales()
    }

    private fun enlazarVistas(view: View) {
        scrollPrincipal = view.findViewById(R.id.scrollPrincipal)
        cardFormulario = view.findViewById(R.id.cardFormulario)
        rvPacientes = view.findViewById(R.id.rvPacientes)
        tvSinResultados = view.findViewById(R.id.tvSinResultados)

        spTipoDocumento = view.findViewById(R.id.spTipoDocumento)
        etNumeroDocumento = view.findViewById(R.id.etNumeroDocumento)
        etEmail = view.findViewById(R.id.etEmail)
        tilPassword = view.findViewById(R.id.tilPassword)
        etPassword = view.findViewById(R.id.etPassword)
        etPrimerNombre = view.findViewById(R.id.etPrimerNombre)
        etSegundoNombre = view.findViewById(R.id.etSegundoNombre)
        etPrimerApellido = view.findViewById(R.id.etPrimerApellido)
        etSegundoApellido = view.findViewById(R.id.etSegundoApellido)
        etFechaNacimiento = view.findViewById(R.id.etFechaNacimiento)
        etNumeroCelular = view.findViewById(R.id.etNumeroCelular)
        spTipoSangre = view.findViewById(R.id.spTipoSangre)
        spGenero = view.findViewById(R.id.spGenero)
        etNombreAcudiente = view.findViewById(R.id.etNombreAcudiente)
        etDocumentoAcudiente = view.findViewById(R.id.etDocumentoAcudiente)
        spEstadoPaciente = view.findViewById(R.id.spEstadoPaciente)
        etBusqueda = view.findViewById(R.id.etBusquedaPaciente)

        adapter = GestorPacientes(emptyList(), { idTipo -> obtenerSiglaDoc(idTipo) }) { paciente ->
            eligeRegistro(paciente)
        }
        rvPacientes.layoutManager = LinearLayoutManager(requireContext())
        rvPacientes.adapter = adapter
    }

    private fun configurarSpinnersFijos() {
        val ctx = requireContext()
        spTipoSangre.adapter = ArrayAdapter(ctx, android.R.layout.simple_spinner_dropdown_item, opcionesSangre)
        spGenero.adapter = ArrayAdapter(ctx, android.R.layout.simple_spinner_dropdown_item, opcionesGenero)
        spEstadoPaciente.adapter = ArrayAdapter(ctx, android.R.layout.simple_spinner_dropdown_item, opcionesEstado)
    }

    private fun configurarEventos(view: View) {
        etBusqueda.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) = filtrarPacientes(s.toString())
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        etFechaNacimiento.setOnClickListener {
            val cal = Calendar.getInstance()
            DatePickerDialog(
                requireContext(),
                { _, year, month, day ->
                    val fechaFormateada = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, day)
                    etFechaNacimiento.setText(fechaFormateada)
                },
                cal.get(Calendar.YEAR),
                cal.get(Calendar.MONTH),
                cal.get(Calendar.DAY_OF_MONTH)
            ).show()
        }

        view.findViewById<Button>(R.id.btnActualizar).setOnClickListener { actualizar() }
        view.findViewById<Button>(R.id.btnCancelar).setOnClickListener {
            cardFormulario.visibility = View.GONE
            pacienteSeleccionado = null
        }
    }

    private fun obtenerDatosIniciales() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val deferredPacientes = async { apiService.obtenerPacientes() }
                val deferredTiposDoc = async { apiService.obtenerTiposDocumento() }

                val resPacientes = deferredPacientes.await()
                val resTiposDoc = deferredTiposDoc.await()

                if (resTiposDoc.isSuccessful) {
                    tiposDoc = resTiposDoc.body() ?: emptyList()
                    spTipoDocumento.adapter = ArrayAdapter(
                        requireContext(),
                        android.R.layout.simple_spinner_dropdown_item,
                        tiposDoc
                    )
                }

                if (resPacientes.isSuccessful) {
                    val crudos = resPacientes.body() ?: emptyList()
                    listPacientes = crudos.map { p ->
                        val fechaCorta = if (p.fecha_nacimiento.contains("T")) p.fecha_nacimiento.split("T")[0] else p.fecha_nacimiento
                        p.copy(
                            fecha_nacimiento = fechaCorta,
                            segundo_nombre = if (p.segundo_nombre == "null") "" else p.segundo_nombre ?: "",
                            segundo_apellido = if (p.segundo_apellido == "null") "" else p.segundo_apellido ?: "",
                            nombre_acudiente = if (p.nombre_acudiente == "null") "" else p.nombre_acudiente ?: "",
                            documento_acudiente = if (p.documento_acudiente == "null") "" else p.documento_acudiente ?: ""
                        )
                    }
                    filtrarPacientes(etBusqueda.text.toString())
                } else if (resPacientes.code() == 404) {
                    listPacientes = emptyList()
                    filtrarPacientes("")
                } else {
                    Toast.makeText(requireContext(), "Error al cargar pacientes (${resPacientes.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error de conexión: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun filtrarPacientes(query: String) {
        val termino = query.lowercase().trim()
        val filtrados = listPacientes.filter { p ->
            val nombreCompleto = "${p.primer_nombre} ${p.segundo_nombre} ${p.primer_apellido} ${p.segundo_apellido}".lowercase()
            nombreCompleto.contains(termino) || p.numero_documento.contains(termino)
        }
        adapter.actualizarLista(filtrados)
        tvSinResultados.visibility = if (filtrados.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun eligeRegistro(paciente: Paciente) {
        pacienteSeleccionado = paciente

        val posTipoDoc = tiposDoc.indexOfFirst { it.id == paciente.id_tipo_documento }
        if (posTipoDoc >= 0) spTipoDocumento.setSelection(posTipoDoc)

        etNumeroDocumento.setText(paciente.numero_documento)
        etEmail.setText(paciente.email)
        etPassword.setText("********")
        tilPassword.error = null

        etPrimerNombre.setText(paciente.primer_nombre)
        etSegundoNombre.setText(paciente.segundo_nombre)
        etPrimerApellido.setText(paciente.primer_apellido)
        etSegundoApellido.setText(paciente.segundo_apellido)
        etFechaNacimiento.setText(paciente.fecha_nacimiento)
        etNumeroCelular.setText(paciente.numero_celular)

        val posSangre = opcionesSangre.indexOf(paciente.tipo_sangre)
        if (posSangre >= 0) spTipoSangre.setSelection(posSangre)

        val posGenero = opcionesGenero.indexOf(paciente.genero)
        if (posGenero >= 0) spGenero.setSelection(posGenero)

        etNombreAcudiente.setText(paciente.nombre_acudiente)
        etDocumentoAcudiente.setText(paciente.documento_acudiente)

        val posEstado = opcionesEstado.indexOf(paciente.estado_paciente)
        if (posEstado >= 0) spEstadoPaciente.setSelection(posEstado)

        cardFormulario.visibility = View.VISIBLE
        scrollPrincipal.smoothScrollTo(0, 0)
    }

    private fun actualizar() {
        val actual = pacienteSeleccionado ?: return
        val pass = etPassword.text.toString()
        tilPassword.error = null

        if (pass.length < 8) {
            tilPassword.error = "Mínimo 8 caracteres"
            AlertDialog.Builder(requireContext())
                .setTitle("¡Precaución!")
                .setMessage("La contraseña debe tener mínimo 8 caracteres")
                .setPositiveButton("Aceptar", null)
                .show()
            return
        }

        val tipoDocElegido = spTipoDocumento.selectedItem as? TipoDocumento
        val pacienteActualizado = actual.copy(
            id_tipo_documento = tipoDocElegido?.id ?: actual.id_tipo_documento,
            numero_documento = etNumeroDocumento.text.toString().trim(),
            email = etEmail.text.toString().trim(),
            password = pass,
            primer_nombre = etPrimerNombre.text.toString().trim(),
            segundo_nombre = etSegundoNombre.text.toString().trim(),
            primer_apellido = etPrimerApellido.text.toString().trim(),
            segundo_apellido = etSegundoApellido.text.toString().trim(),
            fecha_nacimiento = etFechaNacimiento.text.toString().trim(),
            numero_celular = etNumeroCelular.text.toString().trim(),
            tipo_sangre = spTipoSangre.selectedItem.toString(),
            genero = spGenero.selectedItem.toString(),
            nombre_acudiente = etNombreAcudiente.text.toString().trim(),
            documento_acudiente = etDocumentoAcudiente.text.toString().trim(),
            estado_paciente = spEstadoPaciente.selectedItem.toString()
        )

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = apiService.actualizarPaciente(actual.id, pacienteActualizado)
                if (res.isSuccessful) {
                    obtenerDatosIniciales()
                    AlertDialog.Builder(requireContext())
                        .setTitle("¡Paciente Actualizado!")
                        .setMessage("El paciente ha sido actualizado en el sistema exitosamente.")
                        .setCancelable(false)
                        .setPositiveButton("Continuar") { _, _ ->
                            cardFormulario.visibility = View.GONE
                            pacienteSeleccionado = null
                        }
                        .show()
                } else {
                    Toast.makeText(requireContext(), "Error al actualizar (${res.code()})", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error en el servidor: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun obtenerSiglaDoc(idTipo: Int): String {
        return tiposDoc.find { it.id == idTipo }?.sigla ?: "N/A"
    }
}
