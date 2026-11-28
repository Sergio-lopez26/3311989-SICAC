package com.example.sicac.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.sicac.R
import com.example.sicac.data.remote.models.TipoServicio

class GestorTiposServicio(
    private var lista: List<TipoServicio>,
    private val onClickTipo: (TipoServicio) -> Unit
) : RecyclerView.Adapter<GestorTiposServicio.TipoViewHolder>() {

    class TipoViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNombreTipo: TextView = view.findViewById(R.id.tvNombreTipo)
        val tvPrecioBadge: TextView = view.findViewById(R.id.tvPrecioBadge)
        val tvIdTipo: TextView = view.findViewById(R.id.tvIdTipo)
        val tvDescripcion: TextView = view.findViewById(R.id.tvDescripcion)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TipoViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.gestor_tipos_servicio, parent, false)
        return TipoViewHolder(view)
    }

    override fun onBindViewHolder(holder: TipoViewHolder, position: Int) {
        val t = lista[position]

        holder.tvNombreTipo.text = t.tipo_servicio
        holder.tvPrecioBadge.text = formatoPrecio(t.precio_actual)
        holder.tvIdTipo.text = "ID: ${t.id}"
        holder.tvDescripcion.text = t.descripcion

        holder.itemView.setOnClickListener { onClickTipo(t) }
    }

    override fun getItemCount(): Int = lista.size

    fun actualizarLista(nuevaLista: List<TipoServicio>) {
        lista = nuevaLista
        notifyDataSetChanged()
    }
}
