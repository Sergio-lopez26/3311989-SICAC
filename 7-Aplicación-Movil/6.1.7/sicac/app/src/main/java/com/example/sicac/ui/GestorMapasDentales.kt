package com.example.sicac.ui

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.sicac.R
import com.example.sicac.data.remote.models.MapaDental

class GestorMapasDentales(
    private var lista: List<MapaDental>,
    private val onClickMapa: (MapaDental) -> Unit,
    private val onVerOdontograma: (MapaDental) -> Unit
) : RecyclerView.Adapter<GestorMapasDentales.MapaViewHolder>() {

    class MapaViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNombreMapa: TextView = view.findViewById(R.id.tvNombreMapa)
        val tvEstadoBadge: TextView = view.findViewById(R.id.tvEstadoBadge)
        val tvHistorial: TextView = view.findViewById(R.id.tvHistorial)
        val tvObservacion: TextView = view.findViewById(R.id.tvObservacion)
        val btnVerOdontograma: Button = view.findViewById(R.id.btnVerOdontograma)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MapaViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.gestor_mapas_dentales, parent, false)
        return MapaViewHolder(view)
    }

    override fun onBindViewHolder(holder: MapaViewHolder, position: Int) {
        val m = lista[position]

        holder.tvNombreMapa.text = m.nombre_estandar
        holder.tvHistorial.text = "ID: ${m.id} | Historial médico: ${m.id_historial_medico}"
        holder.tvObservacion.text = "Observación: ${if (m.observacion_inicial.isNullOrBlank()) "Ninguna" else m.observacion_inicial}"

        holder.tvEstadoBadge.text = m.estado_mapa_dental
        holder.tvEstadoBadge.setBackgroundColor(
            if (m.estado_mapa_dental == "Activo") Color.parseColor("#198754") else Color.parseColor("#DC3545")
        )

        holder.itemView.setOnClickListener { onClickMapa(m) }
        holder.btnVerOdontograma.setOnClickListener { onVerOdontograma(m) }
    }

    override fun getItemCount(): Int = lista.size

    fun actualizarLista(nuevaLista: List<MapaDental>) {
        lista = nuevaLista
        notifyDataSetChanged()
    }
}
