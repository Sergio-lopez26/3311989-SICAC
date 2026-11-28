package com.example.sicac.ui

import android.app.AlertDialog
import android.content.res.ColorStateList
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.core.widget.NestedScrollView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.example.sicac.R
//Importanciones propias del proyecto
import com.example.sicac.data.remote.PiezaDentalApi
import com.example.sicac.data.remote.RetrofitClient
import com.example.sicac.data.remote.mensajeError
import com.example.sicac.data.remote.models.PiezaDental
//Importaciones de diseño
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import com.google.android.material.textfield.TextInputEditText
//Corrutinas para tareas pesadas
import kotlinx.coroutines.launch

class GestionarOdontograma : Fragment() {

    private val apiService: PiezaDentalApi by lazy {
        RetrofitClient.getClient(requireContext()).create(PiezaDentalApi::class.java)
    }

    //Códigos FDI de las 32 piezas permanentes, como se ven en un odontograma real
    private val filaSuperior = listOf(18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28)
    private val filaInferior = listOf(48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38)

    //Estados clínicos y el color con el que se pinta cada diente
    private val estados = linkedMapOf(
        "Sano" to "#8fce8f",
        "Cariado" to "#f28b82",
        "Obturado" to "#8ab4f8",
        "Ausente" to "#c9c9c9",
        "Corona" to "#ffd966",
        "Endodoncia" to "#d9a3e0",
        "Fracturado" to "#f6b26b",
        "Sellante" to "#a6d8d8",
        "Extracción Indicada" to "#e06666"
    )

    private var idMapa: Int = -1
    private var piezas: List<PiezaDental> = emptyList() //Piezas ya registradas en este mapa
    private var fdiSeleccionado: Int? = null
    private val botonesDientes = mutableMapOf<Int, MaterialButton>()

    private lateinit var scrollOdontograma: NestedScrollView
    private lateinit var tvInfoMapa: TextView
    private lateinit var llFilaSuperior: LinearLayout
    private lateinit var llFilaInferior: LinearLayout
    private lateinit var llLeyenda: LinearLayout
    private lateinit var cardPieza: MaterialCardView
    private lateinit var tvTituloPieza: TextView
    private lateinit var etCuadrante: TextInputEditText
    private lateinit var etPosicion: TextInputEditText
    private lateinit var spEstadoInicial: Spinner
    private lateinit var spEstadoActual: Spinner
    private lateinit var btnGuardarPieza: Button

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_odontograma, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        idMapa = arguments?.getInt("idMapa", -1) ?: -1
        if (idMapa == -1) {
            Toast.makeText(requireContext(), "Mapa dental no válido", Toast.LENGTH_SHORT).show()
            findNavController().popBackStack()
            return
        }

        enlazarVistas(view)
        val nombreMapa = arguments?.getString("nombreMapa")
        tvInfoMapa.text = if (nombreMapa != null) "Mapa: $nombreMapa (ID $idMapa)" else "Mapa dental ID $idMapa"

        val nombresEstado = estados.keys.toList()
        spEstadoInicial.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, nombresEstado)
        spEstadoActual.adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_dropdown_item, nombresEstado)

        construirOdontograma()
        construirLeyenda()

        view.findViewById<Button>(R.id.btnVolver).setOnClickListener { findNavController().popBackStack() }
        btnGuardarPieza.setOnClickListener { guardarPieza() }
        view.findViewById<Button>(R.id.btnCerrarPieza).setOnClickListener { cerrarPanel() }

        viewLifecycleOwner.lifecycleScope.launch { cargarPiezas() }
    }

    private fun enlazarVistas(view: View) {
        scrollOdontograma = view.findViewById(R.id.scrollOdontograma)
        tvInfoMapa = view.findViewById(R.id.tvInfoMapa)
        llFilaSuperior = view.findViewById(R.id.llFilaSuperior)
        llFilaInferior = view.findViewById(R.id.llFilaInferior)
        llLeyenda = view.findViewById(R.id.llLeyenda)
        cardPieza = view.findViewById(R.id.cardPieza)
        tvTituloPieza = view.findViewById(R.id.tvTituloPieza)
        etCuadrante = view.findViewById(R.id.etCuadrante)
        etPosicion = view.findViewById(R.id.etPosicion)
        spEstadoInicial = view.findViewById(R.id.spEstadoInicial)
        spEstadoActual = view.findViewById(R.id.spEstadoActual)
        btnGuardarPieza = view.findViewById(R.id.btnGuardarPieza)
    }

    private fun dp(valor: Int): Int = (valor * resources.displayMetrics.density).toInt()

    //Crea los 32 botones una sola vez; después solo se les cambia el color
    private fun construirOdontograma() {
        llFilaSuperior.removeAllViews()
        llFilaInferior.removeAllViews()
        botonesDientes.clear()

        filaSuperior.forEach { fdi -> llFilaSuperior.addView(crearBotonDiente(fdi)) }
        filaInferior.forEach { fdi -> llFilaInferior.addView(crearBotonDiente(fdi)) }
        pintarDientes()
    }

    private fun crearBotonDiente(fdi: Int): MaterialButton {
        val boton = MaterialButton(requireContext()).apply {
            text = fdi.toString()
            textSize = 11f
            isAllCaps = false
            setTextColor(Color.BLACK)
            minWidth = 0
            minimumWidth = 0
            insetTop = 0
            insetBottom = 0
            setPadding(0, 0, 0, 0)
            cornerRadius = dp(8)
            layoutParams = LinearLayout.LayoutParams(dp(40), dp(48)).apply {
                setMargins(dp(2), dp(2), dp(2), dp(2))
            }
            setOnClickListener { seleccionarDiente(fdi) }
        }
        botonesDientes[fdi] = boton
        return boton
    }

    private fun construirLeyenda() {
        llLeyenda.removeAllViews()
        estados.forEach { (nombre, color) ->
            val fila = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.HORIZONTAL
                setPadding(0, dp(2), 0, dp(2))
            }
            val muestra = View(requireContext()).apply {
                setBackgroundColor(Color.parseColor(color))
                layoutParams = LinearLayout.LayoutParams(dp(16), dp(16)).apply { setMargins(0, 0, dp(8), 0) }
            }
            val etiqueta = TextView(requireContext()).apply { text = nombre }
            fila.addView(muestra)
            fila.addView(etiqueta)
            llLeyenda.addView(fila)
        }
    }

    //Acepta variantes como "Sana"/"Sano" o "extraccion indicada" sin tilde
    private fun normalizarEstado(estado: String?): String {
        if (estado.isNullOrBlank()) return "Sano"
        val equivalencias = mapOf(
            "sano" to "Sano", "sana" to "Sano",
            "cariado" to "Cariado", "obturado" to "Obturado", "ausente" to "Ausente",
            "corona" to "Corona", "endodoncia" to "Endodoncia", "fracturado" to "Fracturado",
            "sellante" to "Sellante",
            "extraccion indicada" to "Extracción Indicada", "extracción indicada" to "Extracción Indicada",
            "extraccion_indicada" to "Extracción Indicada", "extracción_indicada" to "Extracción Indicada"
        )
        return equivalencias[estado.trim().lowercase()] ?: "Sano"
    }

    private fun buscarPieza(fdi: Int): PiezaDental? =
        piezas.find { it.nomenclatura_fdi == fdi.toString() }

    private fun colorDiente(fdi: Int): Int {
        val pieza = buscarPieza(fdi) ?: return Color.WHITE //Sin registrar aún
        val estado = normalizarEstado(pieza.estado_actual ?: pieza.estado_inicial)
        return Color.parseColor(estados[estado] ?: "#FFFFFF")
    }

    private fun pintarDientes() {
        botonesDientes.forEach { (fdi, boton) ->
            boton.backgroundTintList = ColorStateList.valueOf(colorDiente(fdi))
            val activo = fdi == fdiSeleccionado
            boton.strokeWidth = if (activo) dp(3) else dp(1)
            boton.strokeColor = ColorStateList.valueOf(if (activo) Color.parseColor("#103e6e") else Color.GRAY)
        }
    }

    private suspend fun cargarPiezas() {
        try {
            val res = apiService.obtenerPiezasPorMapa(idMapa)
            if (res.isSuccessful) {
                piezas = res.body()?.piezas_dentales ?: emptyList()
            } else {
                Toast.makeText(requireContext(), "Error al cargar piezas (${res.code()})", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Toast.makeText(requireContext(), "Error de conexión: ${e.message}", Toast.LENGTH_LONG).show()
        }
        pintarDientes()
    }

    //Al tocar un diente se carga (o inicializa) el panel correspondiente
    private fun seleccionarDiente(fdi: Int) {
        fdiSeleccionado = fdi
        val pieza = buscarPieza(fdi)
        val nombresEstado = estados.keys.toList()

        tvTituloPieza.text = "Pieza $fdi"
        etCuadrante.setText((fdi / 10).toString())
        etPosicion.setText((fdi % 10).toString())

        val estadoInicial = normalizarEstado(pieza?.estado_inicial)
        val estadoActual = normalizarEstado(pieza?.estado_actual ?: pieza?.estado_inicial)
        spEstadoInicial.setSelection(nombresEstado.indexOf(estadoInicial).coerceAtLeast(0))
        spEstadoActual.setSelection(nombresEstado.indexOf(estadoActual).coerceAtLeast(0))

        btnGuardarPieza.text = if (pieza == null) "Registrar" else "Actualizar"
        cardPieza.visibility = View.VISIBLE
        pintarDientes()
        scrollOdontograma.post { scrollOdontograma.smoothScrollTo(0, cardPieza.top) }
    }

    private fun cerrarPanel() {
        fdiSeleccionado = null
        cardPieza.visibility = View.GONE
        pintarDientes()
    }

    private fun guardarPieza() {
        val fdi = fdiSeleccionado ?: return
        val existente = buscarPieza(fdi)

        val pieza = PiezaDental(
            id = existente?.id ?: 0,
            id_mapa = idMapa,
            nomenclatura_fdi = fdi.toString(),
            cuadrante = fdi / 10,
            posicion = fdi % 10,
            estado_inicial = spEstadoInicial.selectedItem.toString(),
            estado_actual = spEstadoActual.selectedItem.toString()
        )

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = if (existente == null) apiService.registrarPieza(pieza)
                else apiService.actualizarPieza(existente.id, pieza)

                if (res.isSuccessful) {
                    cargarPiezas()
                    //Se vuelve a seleccionar para que el panel quede en modo "Actualizar"
                    //con el id real y no se cree una pieza duplicada al guardar otra vez
                    seleccionarDiente(fdi)
                    AlertDialog.Builder(requireContext())
                        .setTitle("¡Pieza Guardada!")
                        .setMessage("El estado de la pieza dental ha sido guardado exitosamente.")
                        .setPositiveButton("Continuar", null)
                        .show()
                } else {
                    Toast.makeText(requireContext(), res.mensajeError(), Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error en el servidor: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}
