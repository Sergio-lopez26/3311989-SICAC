package com.example.sicac.ui.medico

import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.cardview.widget.CardView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.sicac.R
import com.example.sicac.data.local.TokenManager
import com.example.sicac.data.remote.models.DiagnosticoPacienteItem
import com.example.sicac.data.remote.models.PacienteItem
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

class GestionarAntecedentes : Fragment() {

    private val baseUrl = "https://agreement-cosmic-octane.ngrok-free.dev/api"
    private val gson = Gson()

    private var listPacientes = listOf<PacienteItem>()
    private var pacienteSeleccionado: PacienteItem? = null
    private var idHistorial: Int? = null

    // Vistas
    private lateinit var contenedorBuscador: LinearLayout
    private lateinit var etBuscarPaciente: AutoCompleteTextView
    private lateinit var progressAntecedentes: ProgressBar
    private lateinit var contenedorDetalle: LinearLayout
    private lateinit var tvPacienteSeleccionado: TextView
    private lateinit var tvDocPaciente: TextView
    private lateinit var etAntecedentes: EditText
    private lateinit var tvSinDiagnosticos: TextView
    private lateinit var contenedorListaDiagnosticos: LinearLayout

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_antecedentes, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        contenedorBuscador = view.findViewById(R.id.contenedorBuscadorAntecedentes)
        etBuscarPaciente = view.findViewById(R.id.etBuscarPacienteAntecedentes)
        progressAntecedentes = view.findViewById(R.id.progressAntecedentes)
        contenedorDetalle = view.findViewById(R.id.contenedorDetalleAntecedentes)
        tvPacienteSeleccionado = view.findViewById(R.id.tvPacienteSeleccionadoAnt)
        tvDocPaciente = view.findViewById(R.id.tvDocPacienteAnt)
        etAntecedentes = view.findViewById(R.id.etAntecedentesMedicos)
        tvSinDiagnosticos = view.findViewById(R.id.tvSinDiagnosticos)
        contenedorListaDiagnosticos = view.findViewById(R.id.contenedorListaDiagnosticos)

        etBuscarPaciente.setOnItemClickListener { parent, _, position, _ ->
            val seleccionado = parent.getItemAtPosition(position) as PacienteItem
            seleccionarPaciente(seleccionado)
        }

        view.findViewById<Button>(R.id.btnCambiarPacienteAnt).setOnClickListener {
            pacienteSeleccionado = null
            idHistorial = null
            etAntecedentes.setText("")
            contenedorListaDiagnosticos.removeAllViews()
            contenedorDetalle.visibility = View.GONE
            contenedorBuscador.visibility = View.VISIBLE
        }

        view.findViewById<Button>(R.id.btnGuardarAntecedentes).setOnClickListener {
            guardarAntecedentes()
        }

        obtenerPacientes()
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

    private fun obtenerPacientes() {
        val token = obtenerToken()
        progressAntecedentes.visibility = View.VISIBLE

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val jsonPacientes = withContext(Dispatchers.IO) { httpGet("$baseUrl/paciente", token) }
                listPacientes = parsearLista<PacienteItem>(jsonPacientes)
                val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, listPacientes)
                etBuscarPaciente.setAdapter(adapter)
            } catch (e: Exception) {
                if (isAdded) {
                    Toast.makeText(requireContext(), "Error al cargar pacientes: ${e.message}", Toast.LENGTH_LONG).show()
                }
            } finally {
                if (isAdded) progressAntecedentes.visibility = View.GONE
            }
        }
    }

    private fun seleccionarPaciente(paciente: PacienteItem) {
        pacienteSeleccionado = paciente
        etBuscarPaciente.setText("")

        tvPacienteSeleccionado.text = "Paciente seleccionado: ${paciente.nombreCompleto()}"
        tvDocPaciente.text = "Documento: ${paciente.numero_documento ?: "N/A"}"

        contenedorBuscador.visibility = View.GONE
        contenedorDetalle.visibility = View.VISIBLE
        progressAntecedentes.visibility = View.VISIBLE

        val token = obtenerToken()

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                supervisorScope {
                    // 1. Obtener historial_medico del paciente
                    val historialDeferred = async(Dispatchers.IO) {
                        try {
                            httpGet("$baseUrl/historial_medico/paciente/${paciente.id}", token)
                        } catch (e: HttpNotFoundException) {
                            null // 404 significa que aún no tiene historial creado
                        }
                    }

                    // 2. Obtener diagnósticos anteriores del paciente
                    val diagnosticosDeferred = async(Dispatchers.IO) {
                        try {
                            httpGet("$baseUrl/diagnostico/paciente/${paciente.id}", token)
                        } catch (e: HttpNotFoundException) {
                            null // 404 significa que aún no tiene diagnósticos
                        }
                    }

                    val jsonHistorial = historialDeferred.await()
                    if (jsonHistorial != null) {
                        val parsed = JSONTokener(jsonHistorial.trim()).nextValue()
                        val objHistorial = when {
                            parsed is JSONObject && parsed.has("data") && parsed.get("data") is JSONObject -> parsed.getJSONObject("data")
                            parsed is JSONObject -> parsed
                            parsed is JSONArray && parsed.length() > 0 -> parsed.getJSONObject(0)
                            else -> null
                        }

                        if (objHistorial != null && objHistorial.has("id")) {
                            idHistorial = objHistorial.optInt("id")
                            val textoAnt = objHistorial.optString("antecedentes_medicos", "")
                            etAntecedentes.setText(if (textoAnt == "null") "" else textoAnt)
                        } else {
                            idHistorial = null
                            etAntecedentes.setText("")
                        }
                    } else {
                        idHistorial = null
                        etAntecedentes.setText("")
                    }

                    val jsonDiagnosticos = diagnosticosDeferred.await()
                    if (jsonDiagnosticos != null) {
                        val listaDiag = parsearLista<DiagnosticoPacienteItem>(jsonDiagnosticos)
                        renderizarDiagnosticos(listaDiag)
                    } else {
                        renderizarDiagnosticos(emptyList())
                    }
                }
            } catch (e: Exception) {
                if (isAdded) {
                    Toast.makeText(requireContext(), "Error al consultar historial: ${e.message}", Toast.LENGTH_LONG).show()
                }
            } finally {
                if (isAdded) progressAntecedentes.visibility = View.GONE
            }
        }
    }

    private fun renderizarDiagnosticos(lista: List<DiagnosticoPacienteItem>) {
        contenedorListaDiagnosticos.removeAllViews()

        if (lista.isEmpty()) {
            tvSinDiagnosticos.visibility = View.VISIBLE
            return
        }

        tvSinDiagnosticos.visibility = View.GONE
        val ctx = requireContext()

        for (diag in lista) {
            val card = CardView(ctx).apply {
                radius = 32f
                cardElevation = 4f
                setCardBackgroundColor(Color.WHITE)
                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = 28
                }
                layoutParams = params
            }

            val inner = LinearLayout(ctx).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(40, 36, 40, 36)
            }

            // Fila superior: Motivo y Fecha
            val headerRow = LinearLayout(ctx).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 20 }
            }

            val colMotivo = LinearLayout(ctx).apply {
                orientation = LinearLayout.VERTICAL
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }

            val lblMotivo = TextView(ctx).apply {
                text = "MOTIVO DE CONSULTA"
                textSize = 11f
                setTypeface(null, Typeface.BOLD)
                setTextColor(Color.parseColor("#0D6EFD"))
            }

            val tvMotivo = TextView(ctx).apply {
                text = diag.motivo ?: "Sin motivo"
                textSize = 16f
                setTypeface(null, Typeface.BOLD)
                setTextColor(Color.parseColor("#212529"))
            }

            colMotivo.addView(lblMotivo)
            colMotivo.addView(tvMotivo)

            val tvFecha = TextView(ctx).apply {
                text = "Fecha: ${diag.fechaCorta()}"
                textSize = 12f
                setTextColor(Color.parseColor("#6C757D"))
                setBackgroundColor(Color.parseColor("#F8F9FA"))
                setPadding(20, 10, 20, 10)
            }

            headerRow.addView(colMotivo)
            headerRow.addView(tvFecha)
            inner.addView(headerRow)

            // Bloque Tratamiento Sugerido
            val boxTratamiento = LinearLayout(ctx).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.parseColor("#F8F9FA"))
                setPadding(28, 20, 28, 20)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 16 }
            }
            boxTratamiento.addView(TextView(ctx).apply {
                text = "Tratamiento sugerido:"
                setTypeface(null, Typeface.BOLD)
                setTextColor(Color.parseColor("#0D6EFD"))
            })
            boxTratamiento.addView(TextView(ctx).apply {
                text = diag.tratamiento_sugerido ?: "N/A"
                setTextColor(Color.parseColor("#212529"))
            })
            inner.addView(boxTratamiento)

            // Bloque Observaciones
            val boxObs = LinearLayout(ctx).apply {
                orientation = LinearLayout.VERTICAL
                setBackgroundColor(Color.parseColor("#F8F9FA"))
                setPadding(28, 20, 28, 20)
            }
            boxObs.addView(TextView(ctx).apply {
                text = "Observaciones:"
                setTypeface(null, Typeface.BOLD)
                setTextColor(Color.parseColor("#0D6EFD"))
            })
            boxObs.addView(TextView(ctx).apply {
                text = diag.observaciones ?: "N/A"
                setTextColor(Color.parseColor("#6C757D"))
            })
            inner.addView(boxObs)

            card.addView(inner)
            contenedorListaDiagnosticos.addView(card)
        }
    }

    private fun guardarAntecedentes() {
        val paciente = pacienteSeleccionado ?: return
        val textoAntecedentes = etAntecedentes.text.toString().trim()

        if (textoAntecedentes.isEmpty()) {
            Toast.makeText(requireContext(), "Escribe los antecedentes médicos del paciente.", Toast.LENGTH_SHORT).show()
            return
        }

        val token = obtenerToken()
        progressAntecedentes.visibility = View.VISIBLE

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val historialActual = idHistorial
                if (historialActual != null) {
                    // Actualizar historial existente (PUT)
                    val body = JSONObject().apply {
                        put("antecedentes_medicos", textoAntecedentes)
                    }
                    val (code, resp) = withContext(Dispatchers.IO) {
                        httpRequest("PUT", "$baseUrl/historial_medico/$historialActual", body.toString(), token)
                    }
                    if (code in 200..299) {
                        AlertDialog.Builder(requireContext())
                            .setTitle("¡Actualizado!")
                            .setMessage("Antecedentes actualizados exitosamente.")
                            .setPositiveButton("Aceptar", null)
                            .show()
                    } else {
                        val err = try { JSONObject(resp).optString("error", "Error al actualizar") } catch (_: Exception) { "HTTP $code" }
                        Toast.makeText(requireContext(), err, Toast.LENGTH_LONG).show()
                    }
                } else {
                    // Crear historial nuevo (POST)
                    val body = JSONObject().apply {
                        put("id_paciente", paciente.id)
                        put("antecedentes_medicos", textoAntecedentes)
                    }
                    val (code, resp) = withContext(Dispatchers.IO) {
                        httpRequest("POST", "$baseUrl/historial_medico", body.toString(), token)
                    }
                    if (code in 200..299) {
                        val jsonResp = JSONObject(resp)
                        val nuevoId = jsonResp.optInt("id", jsonResp.optJSONObject("data")?.optInt("id") ?: 0)
                        if (nuevoId > 0) idHistorial = nuevoId

                        AlertDialog.Builder(requireContext())
                            .setTitle("¡Guardado!")
                            .setMessage("Historial creado exitosamente.")
                            .setPositiveButton("Aceptar", null)
                            .show()
                    } else {
                        val err = try { JSONObject(resp).optString("error", "Error al guardar") } catch (_: Exception) { "HTTP $code" }
                        Toast.makeText(requireContext(), err, Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error de conexión con el servidor.", Toast.LENGTH_LONG).show()
            } finally {
                if (isAdded) progressAntecedentes.visibility = View.GONE
            }
        }
    }

    // --- Utilidades HTTP ---
    private class HttpNotFoundException(msg: String) : Exception(msg)

    private fun httpGet(urlStr: String, token: String): String {
        val conn = (URL(urlStr).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            setRequestProperty("ngrok-skip-browser-warning", "true")
            setRequestProperty("Accept", "application/json")
            if (token.isNotBlank()) setRequestProperty("Authorization", "Bearer $token")
            connectTimeout = 10000
            readTimeout = 10000
        }
        val code = conn.responseCode
        if (code == 404) throw HttpNotFoundException("404 en $urlStr")
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
            if (token.isNotBlank()) setRequestProperty("Authorization", "Bearer $token")
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