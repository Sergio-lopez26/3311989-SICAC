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
import com.example.sicac.data.remote.models.Medico
import com.example.sicac.data.remote.models.TipoDocumento
import com.example.sicac.data.remote.MedicoApi
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

class GestionarMedicos : Fragment() {

    private val apiService: MedicoApi by lazy {
        RetrofitClient.getClient(requireContext()).create(MedicoApi::class.java)
    }

    private var listMedicos: List<Medico> = emptyList()
    private var tiposDoc: List<TipoDocumento> = emptyList()
    private var medicoSeleccionado: Medico? = null

    private lateinit var adapter: GestorMedicos
    private lateinit var scrollPrincipalM: NestedScrollView
    private lateinit var cardFormularioM: MaterialCardView
    private lateinit var rvMedicos: RecyclerView
    private lateinit var tvSinResultados: TextView

    // Campos del formulario
    private lateinit var spTipoDocumento: Spinner
    private lateinit var etNumeroDocumento: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var tilPassword: TextInputLayout
    private lateinit var etPassword: TextInputEditText
    private lateinit var etNombres: TextInputEditText
    private lateinit var etApellidos: TextInputEditText
    private lateinit var etMatriculaProfesional: TextInputEditText
    private lateinit var etNumeroCelular: TextInputEditText
    private lateinit var etFechaRegistro: TextInputEditText
    private lateinit var spEstadoMedico: Spinner
    private lateinit var etBusqueda: TextInputEditText

    private val opcionesEstado = listOf("Activo", "Inactivo")

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_medicos, container, false)
    }
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        enlazarVistas(view)
        configurarSpinnersFijos()
        configurarEventos(view)
        obtenerDatosIniciales()
    }

    private fun enlazarVistas(view: View) {
        scrollPrincipalM = view.findViewById(R.id.scrollPrincipalM)
        cardFormularioM = view.findViewById(R.id.cardFormularioM)
        rvMedicos = view.findViewById(R.id.rvMedicos)
        tvSinResultados = view.findViewById(R.id.tvSinResultados)

        spTipoDocumento = view.findViewById(R.id.spTipoDocumento)
        etNumeroDocumento = view.findViewById(R.id.etNumeroDocumento)
        etEmail = view.findViewById(R.id.etEmail)
        tilPassword = view.findViewById(R.id.tilPassword)
        etPassword = view.findViewById(R.id.etPassword)
        etNombres = view.findViewById(R.id.etNombres)
        etApellidos = view.findViewById(R.id.etApellidos)
        etMatriculaProfesional = view.findViewById(R.id.etMatriculaProfesional)
        etNumeroCelular = view.findViewById(R.id.etNumeroCelular)
        etFechaRegistro = view.findViewById(R.id.etFechaRegistro)
        spEstadoMedico = view.findViewById(R.id.spEstadoMedico)
        etBusqueda = view.findViewById(R.id.etBusquedaMedico)

        adapter = GestorMedicos(emptyList(), { idTipo -> obtenerSiglaDoc(idTipo) }) { medico ->
            eligeRegistro(medico)
        }
        rvMedicos.layoutManager = LinearLayoutManager(requireContext())
        rvMedicos.adapter = adapter
    }

    private fun configurarSpinnersFijos() {
        val ctx = requireContext()
        spEstadoMedico.adapter = ArrayAdapter(ctx, android.R.layout.simple_spinner_dropdown_item, opcionesEstado)
    }

    private fun configurarEventos(view: View) {
        etBusqueda.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) = filtrarMedicos(s.toString())
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        etFechaRegistro.setOnClickListener {
            val cal = Calendar.getInstance()
            DatePickerDialog(
                requireContext(),
                { _, year, month, day ->
                    val fechaFormateada = String.format(Locale.US, "%04d-%02d-%02d", year, month + 1, day)
                    etFechaRegistro.setText(fechaFormateada)
                },
                cal.get(Calendar.YEAR),
                cal.get(Calendar.MONTH),
                cal.get(Calendar.DAY_OF_MONTH)
            ).show()
        }

        view.findViewById<Button>(R.id.btnActualizar).setOnClickListener { actualizar() }
        view.findViewById<Button>(R.id.btnCancelar).setOnClickListener {
            cardFormularioM.visibility = View.GONE
            medicoSeleccionado = null
        }
    }

    private fun obtenerDatosIniciales() {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val deferredMedicos = async { apiService.obtenerMedicos() }
                val deferredTiposDoc = async { apiService.obtenerTiposDocumento() }

                val resMedicos = deferredMedicos.await()
                val resTiposDoc = deferredTiposDoc.await()

                if (resTiposDoc.isSuccessful) {
                    tiposDoc = resTiposDoc.body() ?: emptyList()
                    spTipoDocumento.adapter = ArrayAdapter(
                        requireContext(),
                        android.R.layout.simple_spinner_dropdown_item,
                        tiposDoc
                    )
                }

                if (resMedicos.isSuccessful) {
                    val crudos = resMedicos.body() ?: emptyList()
                    listMedicos = crudos.map { m ->
                        val fechaCorta = if (m.fecha_registro.contains("T")) m.fecha_registro.split("T")[0] else m.fecha_registro
                        m.copy(
                            fecha_registro = fechaCorta,
                        )
                    }
                    filtrarMedicos(etBusqueda.text.toString())
                } else if (resMedicos.code() == 404) {
                    listMedicos = emptyList()
                    filtrarMedicos("")
                } else {
                    Toast.makeText(requireContext(), "Error al cargar médicos (${resMedicos.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error de conexión: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun filtrarMedicos(query: String) {
        val termino = query.lowercase().trim()
        val filtrados = listMedicos.filter { m ->
            val nombreCompleto = "${m.nombres} ${m.apellidos}".lowercase()
            nombreCompleto.contains(termino) || m.numero_documento.contains(termino)
        }
        adapter.actualizarLista(filtrados)
        tvSinResultados.visibility = if (filtrados.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun eligeRegistro(medico: Medico) {
        medicoSeleccionado = medico

        val posTipoDoc = tiposDoc.indexOfFirst { it.id == medico.id_tipo_documento }
        if (posTipoDoc >= 0) spTipoDocumento.setSelection(posTipoDoc)

        etNumeroDocumento.setText(medico.numero_documento)
        etEmail.setText(medico.email)
        etPassword.setText("")
        tilPassword.error = null

        etNombres.setText(medico.nombres)
        etApellidos.setText(medico.apellidos)
        etMatriculaProfesional.setText(medico.matricula_profesional)
        etNumeroCelular.setText(medico.numero_celular)
        etFechaRegistro.setText(medico.fecha_registro)

        val posEstado = opcionesEstado.indexOf(medico.estado_medico)
        if (posEstado >= 0) spEstadoMedico.setSelection(posEstado)

        cardFormularioM.visibility = View.VISIBLE
        scrollPrincipalM.smoothScrollTo(0, 0)
    }

    private fun actualizar() {
        val actual = medicoSeleccionado ?: return
        val pass = etPassword.text.toString()
        tilPassword.error = null

        if (pass.isNotEmpty() && pass.length < 8) {
            tilPassword.error = "Mínimo 8 caracteres"
            AlertDialog.Builder(requireContext())
                .setTitle("¡Precaución!")
                .setMessage("La contraseña debe tener mínimo 8 caracteres")
                .setPositiveButton("Aceptar", null)
                .show()
            return
        }

        val tipoDocElegido = spTipoDocumento.selectedItem as? TipoDocumento
        val medicoActualizado = actual.copy(
            id_tipo_documento = tipoDocElegido?.id ?: actual.id_tipo_documento,
            numero_documento = etNumeroDocumento.text.toString().trim(),
            email = etEmail.text.toString().trim(),
            password = if (pass.isEmpty()) null else pass,
            nombres = etNombres.text.toString().trim(),
            apellidos = etApellidos.text.toString().trim(),
            matricula_profesional = etMatriculaProfesional.text.toString().trim(),
            numero_celular = etNumeroCelular.text.toString().trim(),
            fecha_registro = etFechaRegistro.text.toString().trim(),
            estado_medico = spEstadoMedico.selectedItem.toString()
        )

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = apiService.actualizarMedico(actual.id, medicoActualizado)
                if (res.isSuccessful) {
                    obtenerDatosIniciales()
                    AlertDialog.Builder(requireContext())
                        .setTitle("¡Médico Actualizado!")
                        .setMessage("El médico ha sido actualizado en el sistema exitosamente.")
                        .setCancelable(false)
                        .setPositiveButton("Continuar") { _, _ ->
                            cardFormularioM.visibility = View.GONE
                            medicoSeleccionado = null
                        }
                        .show()
                } else {
                    val errorBackend = res.errorBody()?.string() ?: "Sin detalle"
                    android.util.Log.e("API_MEDICOS", "Error ${res.code()}: $errorBackend")
                    Toast.makeText(requireContext(), "Error (${res.code()}): $errorBackend", Toast.LENGTH_LONG).show()
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