package com.example.sicac.ui.medico

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.sicac.R
import com.example.sicac.data.local.TokenManager
import com.example.sicac.data.remote.models.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.supervisorScope
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener
import java.net.HttpURLConnection
import java.net.URL

class GestionarHistorial : Fragment() {

    private val baseUrl = "https://agreement-cosmic-octane.ngrok-free.dev/api"
    private val gson = Gson()

    private var listPacientes = listOf<PacienteItem>()
    private var tiposDiagnostico = mutableListOf<TipoDiagnosticoItem>()
    private var medicamentos = mutableListOf<MedicamentoItem>()
    private var tiposMedicamento = listOf<TipoMedicamentoItem>()
    private var todasLasCitas = listOf<CitaMedicoItem>()

    private var pacienteSeleccionado: PacienteItem? = null
    private var citasDelPaciente = listOf<CitaMedicoItem>()

    private lateinit var etBuscarPaciente: AutoCompleteTextView
    private lateinit var progressHistorial: ProgressBar
    private lateinit var contenedorFormulario: LinearLayout
    private lateinit var tvNombrePacienteSel: TextView
    private lateinit var tvInfoPacienteSel: TextView
    private lateinit var spinnerCita: Spinner
    private lateinit var etMotivo: EditText
    private lateinit var spinnerTipoDiagnostico: Spinner
    private lateinit var etObservaciones: EditText
    private lateinit var etTratamiento: EditText
    private lateinit var spinnerMedicamento: Spinner
    private lateinit var etDosis: EditText

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_historial, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        etBuscarPaciente = view.findViewById(R.id.etBuscarPaciente)
        progressHistorial = view.findViewById(R.id.progressHistorial)
        contenedorFormulario = view.findViewById(R.id.contenedorFormularioHistorial)
        tvNombrePacienteSel = view.findViewById(R.id.tvNombrePacienteSel)
        tvInfoPacienteSel = view.findViewById(R.id.tvInfoPacienteSel)
        spinnerCita = view.findViewById(R.id.spinnerCita)
        etMotivo = view.findViewById(R.id.etMotivo)
        spinnerTipoDiagnostico = view.findViewById(R.id.spinnerTipoDiagnostico)
        etObservaciones = view.findViewById(R.id.etObservaciones)
        etTratamiento = view.findViewById(R.id.etTratamiento)
        spinnerMedicamento = view.findViewById(R.id.spinnerMedicamento)
        etDosis = view.findViewById(R.id.etDosis)

        view.findViewById<Button>(R.id.btnCambiarPaciente).setOnClickListener { cancelar() }
        view.findViewById<Button>(R.id.btnCancelarHistorial).setOnClickListener { cancelar() }
        view.findViewById<Button>(R.id.btnGuardarHistorial).setOnClickListener { guardarHistorial() }
        view.findViewById<Button>(R.id.btnNuevoDiagnostico).setOnClickListener { mostrarModalNuevoDiagnostico() }
        view.findViewById<Button>(R.id.btnNuevoMedicamento).setOnClickListener { mostrarModalNuevoMedicamento() }

        spinnerMedicamento.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, v: View?, position: Int, id: Long) {
                if (position == 0) {
                    etDosis.isEnabled = false
                    etDosis.setText("")
                    etDosis.hint = "N/A"
                } else {
                    etDosis.isEnabled = true
                    etDosis.hint = "Ej. 1 cada 8 hrs"
                }
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        etBuscarPaciente.setOnItemClickListener { parent, _, position, _ ->
            val seleccionado = parent.getItemAtPosition(position) as PacienteItem
            seleccionarPaciente(seleccionado)
        }

        obtenerDatosIniciales()
    }

    private fun obtenerToken(): String {
        return TokenManager(requireContext()).getToken() ?: ""
    }

    private inline fun <reified T> parsearLista(jsonStr: String): MutableList<T> {
        val type = object : TypeToken<MutableList<T>>() {}.type
        val parsed = JSONTokener(jsonStr.trim()).nextValue()

        if (parsed is JSONArray) {
            return gson.fromJson(parsed.toString(), type) ?: mutableListOf()
        }

        if (parsed is JSONObject) {
            if (parsed.has("data") && parsed.get("data") is JSONArray) {
                return gson.fromJson(parsed.getJSONArray("data").toString(), type) ?: mutableListOf()
            }
            val keys = parsed.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val value = parsed.get(key)
                if (value is JSONArray) {
                    return gson.fromJson(value.toString(), type) ?: mutableListOf()
                }
            }
        }
        return mutableListOf()
    }

    private fun obtenerDatosIniciales() {
        val prefs = requireContext().getSharedPreferences("usuario_sesion", Context.MODE_PRIVATE)
        val medicoLog = prefs.getInt("id", 0)
        val token = obtenerToken()

        progressHistorial.visibility = View.VISIBLE

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                supervisorScope {
                    val resPacientes = async(Dispatchers.IO) { httpGet("$baseUrl/paciente", token) }
                    val resDiag = async(Dispatchers.IO) { httpGet("$baseUrl/tipo_diagnostico", token) }
                    val resMed = async(Dispatchers.IO) { httpGet("$baseUrl/medicamento", token) }
                    val resTipoMed = async(Dispatchers.IO) { httpGet("$baseUrl/tipo_medicamento", token) }
                    val resCitas = async(Dispatchers.IO) { httpGet("$baseUrl/cita/medico/$medicoLog", token) }

                    listPacientes = parsearLista<PacienteItem>(resPacientes.await())
                    tiposDiagnostico = parsearLista<TipoDiagnosticoItem>(resDiag.await())
                    medicamentos = parsearLista<MedicamentoItem>(resMed.await())
                    tiposMedicamento = parsearLista<TipoMedicamentoItem>(resTipoMed.await())

                    val citasRaw = parsearLista<CitaMedicoItem>(resCitas.await())
                    todasLasCitas = citasRaw.filter {
                        (it.estado_cita ?: "").trim().equals("programada", ignoreCase = true)
                    }
                }

                configurarBuscadorPacientes()
                actualizarSpinnerDiagnosticos()
                actualizarSpinnerMedicamentos()
            } catch (e: Exception) {
                e.printStackTrace()
                if (isAdded) {
                    AlertDialog.Builder(requireContext())
                        .setTitle("Error Real del Servidor")
                        .setMessage(e.message ?: e.toString())
                        .setPositiveButton("Cerrar", null)
                        .show()
                }
            } finally {
                if (isAdded) {
                    progressHistorial.visibility = View.GONE
                }
            }
        }
    }

    private fun configurarBuscadorPacientes() {
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, listPacientes)
        etBuscarPaciente.setAdapter(adapter)
    }

    private fun seleccionarPaciente(paciente: PacienteItem) {
        pacienteSeleccionado = paciente
        etBuscarPaciente.setText("")

        tvNombrePacienteSel.text = "Paciente: ${paciente.nombreCompleto()}"
        tvInfoPacienteSel.text = "Documento: ${paciente.numero_documento ?: "N/A"} | Sangre: ${paciente.tipo_sangre ?: "N/A"}"

        citasDelPaciente = todasLasCitas.filter {
            it.obtenerIdPacienteReal() == paciente.id
        }

        val opcionesCitas = if (citasDelPaciente.isNotEmpty()) {
            listOf("Seleccione la cita del paciente...") + citasDelPaciente.map { it.toString() }
        } else {
            listOf("El paciente no tiene citas programadas")
        }

        val adapterCitas = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, opcionesCitas)
        spinnerCita.adapter = adapterCitas
        contenedorFormulario.visibility = View.VISIBLE
    }

    private fun actualizarSpinnerDiagnosticos(seleccionarId: Int? = null) {
        val listaDisplay = listOf("Seleccione tipo de diagnóstico...") + tiposDiagnostico.map { it.nombre_diagnostico }
        spinnerTipoDiagnostico.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, listaDisplay)

        if (seleccionarId != null) {
            val idx = tiposDiagnostico.indexOfFirst { it.id == seleccionarId }
            if (idx >= 0) spinnerTipoDiagnostico.setSelection(idx + 1)
        }
    }

    private fun actualizarSpinnerMedicamentos(seleccionarId: Int? = null) {
        val listaDisplay = listOf("Ninguno") + medicamentos.map { it.nombre_medicamento }
        spinnerMedicamento.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, listaDisplay)

        if (seleccionarId != null) {
            val idx = medicamentos.indexOfFirst { it.id == seleccionarId }
            if (idx >= 0) spinnerMedicamento.setSelection(idx + 1)
        }
    }

    private fun guardarHistorial() {
        val paciente = pacienteSeleccionado ?: return
        val token = obtenerToken()

        if (citasDelPaciente.isEmpty() || spinnerCita.selectedItemPosition == 0) {
            Toast.makeText(requireContext(), "Por favor, selecciona la cita asignada para este paciente.", Toast.LENGTH_SHORT).show()
            return
        }
        if (spinnerTipoDiagnostico.selectedItemPosition == 0) {
            Toast.makeText(requireContext(), "Selecciona un tipo de diagnóstico.", Toast.LENGTH_SHORT).show()
            return
        }

        val motivo = etMotivo.text.toString().trim()
        val observaciones = etObservaciones.text.toString().trim()
        val tratamiento = etTratamiento.text.toString().trim()

        if (motivo.isEmpty() || observaciones.isEmpty() || tratamiento.isEmpty()) {
            Toast.makeText(requireContext(), "Completa todos los campos obligatorios.", Toast.LENGTH_SHORT).show()
            return
        }

        val citaSeleccionada = citasDelPaciente[spinnerCita.selectedItemPosition - 1]
        val tipoDiagId = tiposDiagnostico[spinnerTipoDiagnostico.selectedItemPosition - 1].id
        val medId: Any = if (spinnerMedicamento.selectedItemPosition > 0) {
            medicamentos[spinnerMedicamento.selectedItemPosition - 1].id
        } else {
            ""
        }

        val jsonBody = JSONObject().apply {
            put("id_paciente", paciente.id)
            put("motivo", motivo)
            put("observaciones", observaciones)
            put("tratamiento_sugerido", tratamiento)
            put("id_cita", citaSeleccionada.id)
            put("id_tipo_diagnostico", tipoDiagId)
            put("medicamento", medId)
            put("dosis", etDosis.text.toString().trim())
        }

        progressHistorial.visibility = View.VISIBLE
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val (code, response) = withContext(Dispatchers.IO) {
                    httpRequest("POST", "$baseUrl/diagnostico", jsonBody.toString(), token)
                }
                if (code in 200..299) {
                    // Envía los campos requeridos por CitaControlador::update para cambiar estado_cita a "Atendida"
                    val fechaLimpia = (citaSeleccionada.fecha_cita ?: "").split("T").firstOrNull() ?: ""
                    val horaIni = (citaSeleccionada.hora_inicio ?: "").take(5) // Formato H:i requerido por Laravel
                    val horaFin = (citaSeleccionada.hora_fin ?: "").take(5)

                    val updateCitaBody = JSONObject().apply {
                        put("id_paciente", citaSeleccionada.obtenerIdPacienteReal())
                        put("id_medico", citaSeleccionada.id_medico)
                        put("id_tipo_cita", citaSeleccionada.obtenerIdTipoCitaReal())
                        put("fecha_cita", fechaLimpia)
                        put("hora_inicio", horaIni)
                        put("hora_fin", horaFin)
                        put("estado_cita", "Atendida")
                    }

                    withContext(Dispatchers.IO) {
                        try {
                            httpRequest("PUT", "$baseUrl/cita/${citaSeleccionada.id}", updateCitaBody.toString(), token)
                        } catch (_: Exception) {}
                    }

                    AlertDialog.Builder(requireContext())
                        .setTitle("¡Registro Exitoso!")
                        .setMessage("Diagnóstico registrado y cita marcada como Atendida exitosamente.")
                        .setPositiveButton("Aceptar") { d, _ -> d.dismiss() }
                        .show()
                    cancelar()
                    obtenerDatosIniciales()
                } else {
                    val errMsg = try {
                        JSONObject(response).optString("error", JSONObject(response).optString("message", "Error al guardar"))
                    } catch (_: Exception) {
                        "Error HTTP $code"
                    }
                    Toast.makeText(requireContext(), "Error: $errMsg", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error de conexión con el servidor.", Toast.LENGTH_LONG).show()
            } finally {
                if (isAdded) {
                    progressHistorial.visibility = View.GONE
                }
            }
        }
    }

    private fun mostrarModalNuevoDiagnostico() {
        val token = obtenerToken()
        val layout = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 8)
        }
        val etNombre = EditText(requireContext()).apply { hint = "Nombre del Diagnóstico" }
        val etDesc = EditText(requireContext()).apply { hint = "Descripción"; minLines = 2 }
        layout.addView(etNombre)
        layout.addView(etDesc)

        AlertDialog.Builder(requireContext())
            .setTitle("Nuevo Tipo de Diagnóstico")
            .setView(layout)
            .setNegativeButton("Cancelar", null)
            .setPositiveButton("Guardar") { _, _ ->
                val nombre = etNombre.text.toString().trim()
                val desc = etDesc.text.toString().trim()
                if (nombre.isEmpty() || desc.isEmpty()) {
                    Toast.makeText(requireContext(), "Completa ambos campos", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val body = JSONObject().apply {
                    put("nombre_diagnostico", nombre)
                    put("descripcion", desc)
                }
                viewLifecycleOwner.lifecycleScope.launch {
                    try {
                        val (code, resp) = withContext(Dispatchers.IO) {
                            httpRequest("POST", "$baseUrl/tipo_diagnostico", body.toString(), token)
                        }
                        if (code in 200..299) {
                            val jsonResp = JSONObject(resp)
                            val nuevoId = jsonResp.optInt("id", jsonResp.optJSONObject("data")?.optInt("id") ?: 0)
                            val resDiag = withContext(Dispatchers.IO) { httpGet("$baseUrl/tipo_diagnostico", token) }
                            tiposDiagnostico = parsearLista<TipoDiagnosticoItem>(resDiag)
                            actualizarSpinnerDiagnosticos(if (nuevoId > 0) nuevoId else null)
                            Toast.makeText(requireContext(), "Diagnóstico creado", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(requireContext(), "Error al crear diagnóstico ($code)", Toast.LENGTH_SHORT).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .show()
    }

    private fun mostrarModalNuevoMedicamento() {
        val token = obtenerToken()
        val layout = LinearLayout(requireContext()).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 8)
        }
        val spinnerCat = Spinner(requireContext())
        val categoriasDisplay = listOf("Seleccione una categoría") + tiposMedicamento.map { it.categoria_medicamento }
        spinnerCat.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, categoriasDisplay)

        val etNombreMed = EditText(requireContext()).apply { hint = "Nombre del Medicamento" }
        layout.addView(spinnerCat)
        layout.addView(etNombreMed)

        AlertDialog.Builder(requireContext())
            .setTitle("Registrar Medicamento")
            .setView(layout)
            .setNegativeButton("Cancelar", null)
            .setPositiveButton("Guardar") { _, _ ->
                val nombreMed = etNombreMed.text.toString().trim()
                if (spinnerCat.selectedItemPosition == 0 || nombreMed.isEmpty()) {
                    Toast.makeText(requireContext(), "Selecciona categoría y nombre", Toast.LENGTH_SHORT).show()
                    return@setPositiveButton
                }
                val catId = tiposMedicamento[spinnerCat.selectedItemPosition - 1].id
                val body = JSONObject().apply {
                    put("id_tipo_medicamento", catId)
                    put("nombre_medicamento", nombreMed)
                }
                viewLifecycleOwner.lifecycleScope.launch {
                    try {
                        val (code, resp) = withContext(Dispatchers.IO) {
                            httpRequest("POST", "$baseUrl/medicamento", body.toString(), token)
                        }
                        if (code in 200..299) {
                            val jsonResp = JSONObject(resp)
                            val nuevoId = jsonResp.optInt("id", jsonResp.optJSONObject("data")?.optInt("id") ?: 0)
                            val resMed = withContext(Dispatchers.IO) { httpGet("$baseUrl/medicamento", token) }
                            medicamentos = parsearLista<MedicamentoItem>(resMed)
                            actualizarSpinnerMedicamentos(if (nuevoId > 0) nuevoId else null)
                            Toast.makeText(requireContext(), "Medicamento creado", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(requireContext(), "Error al crear medicamento ($code)", Toast.LENGTH_SHORT).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .show()
    }

    private fun cancelar() {
        pacienteSeleccionado = null
        contenedorFormulario.visibility = View.GONE
        etMotivo.text.clear()
        etObservaciones.text.clear()
        etTratamiento.text.clear()
        etDosis.text.clear()
        spinnerTipoDiagnostico.setSelection(0)
        spinnerMedicamento.setSelection(0)
    }

    private fun httpGet(urlStr: String, token: String): String {
        val conn = (URL(urlStr).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            setRequestProperty("ngrok-skip-browser-warning", "true")
            setRequestProperty("Accept", "application/json")
            if (token.isNotBlank()) {
                setRequestProperty("Authorization", "Bearer $token")
            }
            connectTimeout = 10000
            readTimeout = 10000
        }
        val code = conn.responseCode
        if (code !in 200..299) {
            val errorBody = conn.errorStream?.bufferedReader()?.use { it.readText() } ?: "Sin detalle"
            throw Exception("HTTP $code en $urlStr\nRespuesta: $errorBody")
        }
        return conn.inputStream.bufferedReader().use { it.readText() }
    }

    private fun httpRequest(method: String, urlStr: String, jsonBody: String, token: String): Pair<Int, String> {
        val conn = (URL(urlStr).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
            setRequestProperty("ngrok-skip-browser-warning", "true")
            if (token.isNotBlank()) {
                setRequestProperty("Authorization", "Bearer $token")
            }
            doOutput = true
            connectTimeout = 10000
            readTimeout = 10000
        }
        conn.outputStream.use { it.write(jsonBody.toByteArray(Charsets.UTF_8)) }
        val code = conn.responseCode
        val stream = if (code in 200..299) conn.inputStream else conn.errorStream
        val body = stream?.bufferedReader()?.use { it.readText() } ?: ""
        return Pair(code, body)
    }
}