package com.example.sicac.ui.paciente

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.cardview.widget.CardView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.sicac.R
import com.example.sicac.data.local.TokenManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener
import java.net.HttpURLConnection
import java.net.URL

class VerHistorial : Fragment() {

    private val baseUrl = "https://agreement-cosmic-octane.ngrok-free.dev/api"

    private lateinit var contenedorCargando: LinearLayout
    private lateinit var tvError: TextView
    private lateinit var contenedorContenido: LinearLayout
    private lateinit var tvAntecedentes: TextView
    private lateinit var tvSinDiagnosticos: TextView
    private lateinit var contenedorDiagnosticos: LinearLayout

    private data class DiagnosticoDetalleUI(
        val id: Int,
        val fecha: String,
        val medico: String,
        val motivo: String,
        val tipoDiagnostico: String,
        val tratamiento: String,
        val observaciones: String
    )

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.ver_historial, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        contenedorCargando = view.findViewById(R.id.contenedorCargandoHistorial)
        tvError = view.findViewById(R.id.tvErrorVerHistorial)
        contenedorContenido = view.findViewById(R.id.contenedorContenidoVerHistorial)
        tvAntecedentes = view.findViewById(R.id.tvAntecedentesPaciente)
        tvSinDiagnosticos = view.findViewById(R.id.tvSinDiagnosticosPaciente)
        contenedorDiagnosticos = view.findViewById(R.id.contenedorDiagnosticosPaciente)

        obtenerHistorialYDiagnosticos()
    }

    private fun obtenerToken(): String {
        return TokenManager(requireContext()).getToken() ?: ""
    }

    private fun obtenerHistorialYDiagnosticos() {
        val prefs = requireContext().getSharedPreferences("usuario_sesion", Context.MODE_PRIVATE)
        val idUsuario = prefs.getInt("id", 0)
        val token = obtenerToken()

        if (idUsuario == 0) {
            mostrarError("No hay una sesión activa. Por favor, inicia sesión.")
            return
        }

        contenedorCargando.visibility = View.VISIBLE
        tvError.visibility = View.GONE
        contenedorContenido.visibility = View.GONE

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                // 1. Obtener el ID real de la tabla 'paciente' correspondiente al usuario logueado
                val idPaciente = withContext(Dispatchers.IO) {
                    resolverIdPacienteReal(idUsuario, token)
                }

                // 2. Construir el mapa de médicos (id_medico -> "nombres apellidos") desde /api/medico
                val mapaMedicos = withContext(Dispatchers.IO) {
                    obtenerMapaMedicos(token)
                }

                // 3. Consultar historial médico (antecedentes)
                val textoAntecedentes = withContext(Dispatchers.IO) {
                    try {
                        val resHistorial = httpGet("$baseUrl/historial_medico/paciente/$idPaciente", token)
                        val objHist = extraerObjeto(resHistorial)
                        val ant = objHist?.optString("antecedentes_medicos", "") ?: ""
                        if (ant.isBlank() || ant == "null") "No hay antecedentes médicos registrados." else ant
                    } catch (_: HttpNotFoundException) {
                        "No hay antecedentes médicos registrados."
                    }
                }

                // 4. Consultar citas del paciente (GET /api/cita/paciente/{idPaciente})
                val listaDiagnosticos = withContext(Dispatchers.IO) {
                    val resCitas = try {
                        httpGet("$baseUrl/cita/paciente/$idPaciente", token)
                    } catch (_: HttpNotFoundException) {
                        "[]"
                    }

                    val arrayCitas = extraerArreglo(resCitas)
                    val mapaCitas = mutableMapOf<Int, JSONObject>()
                    val citasAtendidas = mutableListOf<JSONObject>()

                    for (i in 0 until arrayCitas.length()) {
                        val cita = arrayCitas.optJSONObject(i) ?: continue
                        val idCita = cita.optInt("id", 0)
                        if (idCita > 0) mapaCitas[idCita] = cita

                        val estado = cita.optString("estado_cita", "")
                        if (estado.trim().equals("Atendida", ignoreCase = true)) {
                            citasAtendidas.add(cita)
                        }
                    }

                    // 5A. Obtener diagnósticos del paciente (/api/diagnostico/paciente/{idPaciente}) y cruzar id_cita -> id_medico
                    val diagDirectos = try {
                        val resDiagPac = httpGet("$baseUrl/diagnostico/paciente/$idPaciente", token)
                        val arrDiag = extraerArreglo(resDiagPac)
                        val lista = mutableListOf<DiagnosticoDetalleUI>()
                        for (i in 0 until arrDiag.length()) {
                            val objDiag = arrDiag.optJSONObject(i) ?: continue
                            val idCita = objDiag.optInt("id_cita", 0)
                            val citaRel = mapaCitas[idCita]

                            val fecha = (citaRel?.optString("fecha_cita", "")
                                ?: objDiag.optString("fecha_registro", ""))
                                .split("T").firstOrNull()?.ifBlank { "N/D" } ?: "N/D"

                            val medicoNombre = resolverNombreMedicoDeCita(citaRel, mapaMedicos)

                            lista.add(
                                DiagnosticoDetalleUI(
                                    id = objDiag.optInt("id", i + 1),
                                    fecha = fecha,
                                    medico = medicoNombre,
                                    motivo = objDiag.optString("motivo", "Sin motivo"),
                                    tipoDiagnostico = extraerNombreTipoDiagnostico(objDiag),
                                    tratamiento = objDiag.optString("tratamiento_sugerido", "N/A"),
                                    observaciones = objDiag.optString("observaciones", "N/A")
                                )
                            )
                        }
                        lista
                    } catch (_: Exception) {
                        emptyList()
                    }

                    if (diagDirectos.isNotEmpty()) {
                        return@withContext diagDirectos
                    }

                    // 5B. Respaldo: consultar cita por cita en /api/diagnostico/cita/{idCita}
                    val deferreds = citasAtendidas.map { cita ->
                        async(Dispatchers.IO) {
                            val idCita = cita.optInt("id", 0)
                            if (idCita == 0) return@async null

                            try {
                                val resDiag = httpGet("$baseUrl/diagnostico/cita/$idCita", token)
                                val parsedDiag = JSONTokener(resDiag.trim()).nextValue()
                                val objDiag = when {
                                    parsedDiag is JSONArray && parsedDiag.length() > 0 -> parsedDiag.getJSONObject(0)
                                    parsedDiag is JSONObject && parsedDiag.has("data") -> {
                                        val d = parsedDiag.get("data")
                                        if (d is JSONArray && d.length() > 0) d.getJSONObject(0) else d as? JSONObject
                                    }
                                    parsedDiag is JSONObject -> parsedDiag
                                    else -> null
                                } ?: return@async null

                                val fecha = cita.optString("fecha_cita", "").split("T").firstOrNull() ?: "N/D"
                                val medicoNombre = resolverNombreMedicoDeCita(cita, mapaMedicos)
                                val nombreTipoDiag = extraerNombreTipoDiagnostico(objDiag)

                                DiagnosticoDetalleUI(
                                    id = objDiag.optInt("id", idCita),
                                    fecha = fecha,
                                    medico = medicoNombre,
                                    motivo = objDiag.optString("motivo", "Sin motivo"),
                                    tipoDiagnostico = nombreTipoDiag,
                                    tratamiento = objDiag.optString("tratamiento_sugerido", "N/A"),
                                    observaciones = objDiag.optString("observaciones", "N/A")
                                )
                            } catch (_: Exception) {
                                null
                            }
                        }
                    }

                    deferreds.awaitAll().filterNotNull()
                }

                if (isAdded) {
                    tvAntecedentes.text = textoAntecedentes
                    renderizarDiagnosticos(listaDiagnosticos)
                    contenedorContenido.visibility = View.VISIBLE
                }

            } catch (e: Exception) {
                if (isAdded) {
                    mostrarError(e.message ?: "Error al obtener la información del historial.")
                }
            } finally {
                if (isAdded) {
                    contenedorCargando.visibility = View.GONE
                }
            }
        }
    }

    // Descarga /api/medico y arma un diccionario [id -> "nombres apellidos"]
    private fun obtenerMapaMedicos(token: String): Map<Int, String> {
        val mapa = mutableMapOf<Int, String>()
        try {
            val resMedicos = httpGet("$baseUrl/medico", token)
            val arr = extraerArreglo(resMedicos)
            for (i in 0 until arr.length()) {
                val med = arr.optJSONObject(i) ?: continue
                val idMed = med.optInt("id", 0)
                if (idMed > 0) {
                    val nombreCompleto = formatearNombrePersona(med)
                    if (nombreCompleto.isNotBlank()) {
                        mapa[idMed] = nombreCompleto
                    }
                }
            }
        } catch (_: Exception) {}
        return mapa
    }

    // Cruza el id_medico de la cita contra el mapa de médicos, el objeto anidado o medico_nombre
    private fun resolverNombreMedicoDeCita(cita: JSONObject?, mapaMedicos: Map<Int, String>): String {
        if (cita == null) return "No asignado"

        // 1. Si viene como campo plano medico_nombre (del JOIN en CitaControlador::porPaciente)
        val plano = cita.optString("medico_nombre", "")
        if (plano.isNotBlank() && plano != "null") return plano

        // 2. Busca directamente por cita.id_medico en el catálogo descargado
        val idMedico = cita.optInt("id_medico", 0)
        if (idMedico > 0 && mapaMedicos.containsKey(idMedico)) {
            return mapaMedicos[idMedico]!!
        }

        // 3. Si viene el objeto medico anidado dentro de la cita
        val medicoObj = cita.optJSONObject("medico")
        if (medicoObj != null) {
            val idAnidado = medicoObj.optInt("id", 0)
            if (idAnidado > 0 && mapaMedicos.containsKey(idAnidado)) {
                return mapaMedicos[idAnidado]!!
            }
            val nombreAnidado = formatearNombrePersona(medicoObj)
            if (nombreAnidado.isNotBlank()) return nombreAnidado
        }

        return if (idMedico > 0) "Médico #$idMedico" else "No asignado"
    }

    private fun formatearNombrePersona(obj: JSONObject): String {
        // 1. Columnas "nombres" y "apellidos" (tabla medico)
        val nombresCol = listOf(
            obj.optString("nombres", ""),
            obj.optString("apellidos", "")
        ).filter { it.isNotBlank() && it != "null" }

        if (nombresCol.isNotEmpty()) return nombresCol.joinToString(" ")

        // 2. Columnas separadas (tabla paciente)
        val partes = listOf(
            obj.optString("primer_nombre", ""),
            obj.optString("segundo_nombre", ""),
            obj.optString("primer_apellido", ""),
            obj.optString("segundo_apellido", "")
        ).filter { it.isNotBlank() && it != "null" }

        if (partes.isNotEmpty()) return partes.joinToString(" ")

        return obj.optString("nombre", "").takeIf { it != "null" } ?: ""
    }

    private fun resolverIdPacienteReal(idUsuario: Int, token: String): Int {
        try {
            val resLista = httpGet("$baseUrl/paciente", token)
            val arr = extraerArreglo(resLista)
            for (i in 0 until arr.length()) {
                val p = arr.optJSONObject(i) ?: continue
                if (p.optInt("id_usuario", 0) == idUsuario) {
                    return p.optInt("id", idUsuario)
                }
            }
        } catch (_: Exception) {}

        return try {
            val resUno = httpGet("$baseUrl/paciente/$idUsuario", token)
            val obj = extraerObjeto(resUno)
            obj?.optInt("id", idUsuario) ?: idUsuario
        } catch (_: Exception) {
            idUsuario
        }
    }

    private fun renderizarDiagnosticos(lista: List<DiagnosticoDetalleUI>) {
        contenedorDiagnosticos.removeAllViews()

        if (lista.isEmpty()) {
            tvSinDiagnosticos.visibility = View.VISIBLE
            return
        }

        tvSinDiagnosticos.visibility = View.GONE
        val ctx = requireContext()

        for (diag in lista) {
            val card = CardView(ctx).apply {
                radius = 28f
                cardElevation = 3f
                setCardBackgroundColor(Color.parseColor("#F8F9FA"))
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 24 }
            }

            val inner = LinearLayout(ctx).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(36, 32, 36, 32)
            }

            val rowTop = LinearLayout(ctx).apply {
                orientation = LinearLayout.HORIZONTAL
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 12 }
            }

            val tvDoctor = TextView(ctx).apply {
                text = "Dr(a). ${diag.medico}"
                textSize = 14f
                setTypeface(null, Typeface.BOLD)
                setTextColor(Color.parseColor("#103E6E"))
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            }

            val tvFecha = TextView(ctx).apply {
                text = diag.fecha
                textSize = 13f
                setTextColor(Color.parseColor("#6C757D"))
            }

            rowTop.addView(tvDoctor)
            rowTop.addView(tvFecha)
            inner.addView(rowTop)

            val tvBadge = TextView(ctx).apply {
                text = diag.tipoDiagnostico
                textSize = 12f
                setTypeface(null, Typeface.BOLD)
                setTextColor(Color.parseColor("#055160"))
                setBackgroundColor(Color.parseColor("#CFF4FC"))
                setPadding(20, 8, 20, 8)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 14 }
            }
            inner.addView(tvBadge)

            inner.addView(TextView(ctx).apply {
                text = "Motivo: ${diag.motivo}"
                textSize = 15f
                setTypeface(null, Typeface.BOLD)
                setTextColor(Color.parseColor("#212529"))
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 8 }
            })

            inner.addView(TextView(ctx).apply {
                text = "Tratamiento: ${diag.tratamiento}"
                textSize = 14f
                setTextColor(Color.parseColor("#212529"))
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { bottomMargin = 6 }
            })

            inner.addView(TextView(ctx).apply {
                text = "Obs: ${diag.observaciones}"
                textSize = 13f
                setTextColor(Color.parseColor("#6C757D"))
            })

            card.addView(inner)
            contenedorDiagnosticos.addView(card)
        }
    }

    private fun mostrarError(mensaje: String) {
        tvError.text = mensaje
        tvError.visibility = View.VISIBLE
        contenedorContenido.visibility = View.GONE
    }

    private fun extraerNombreTipoDiagnostico(diagObj: JSONObject): String {
        val directo = diagObj.optString("nombre_diagnostico", "")
        if (directo.isNotBlank() && directo != "null") return directo

        val tipoObj = diagObj.optJSONObject("tipo_diagnostico")
        if (tipoObj != null) {
            val nombre = tipoObj.optString("nombre_diagnostico", "")
            if (nombre.isNotBlank() && nombre != "null") return nombre
        }

        val idTipo = diagObj.optInt("id_tipo_diagnostico", 0)
        return if (idTipo > 0) "Diagnóstico #$idTipo" else "Diagnóstico General"
    }

    private fun extraerObjeto(jsonStr: String): JSONObject? {
        val parsed = JSONTokener(jsonStr.trim()).nextValue()
        return when {
            parsed is JSONObject && parsed.has("data") && parsed.get("data") is JSONObject -> parsed.getJSONObject("data")
            parsed is JSONObject && parsed.has("paciente") && parsed.get("paciente") is JSONObject -> parsed.getJSONObject("paciente")
            parsed is JSONObject -> parsed
            parsed is JSONArray && parsed.length() > 0 -> parsed.getJSONObject(0)
            else -> null
        }
    }

    private fun extraerArreglo(jsonStr: String): JSONArray {
        val parsed = JSONTokener(jsonStr.trim()).nextValue()
        if (parsed is JSONArray) return parsed
        if (parsed is JSONObject) {
            if (parsed.has("agendamientos") && parsed.get("agendamientos") is JSONArray) {
                return parsed.getJSONArray("agendamientos")
            }
            if (parsed.has("data") && parsed.get("data") is JSONArray) {
                return parsed.getJSONArray("data")
            }
            val keys = parsed.keys()
            while (keys.hasNext()) {
                val valItem = parsed.get(keys.next())
                if (valItem is JSONArray) return valItem
            }
        }
        return JSONArray()
    }

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
}