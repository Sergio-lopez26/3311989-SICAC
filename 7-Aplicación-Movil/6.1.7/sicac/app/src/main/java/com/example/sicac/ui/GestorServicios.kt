package com.example.sicac.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.sicac.R
import com.example.sicac.data.remote.models.Servicio

class GestorServicios(
    private var lista: List<Servicio>,
    private val obtenerNombreTipo: (Int) -> String,
    private val onClickServicio: (Servicio) -> Unit
) : RecyclerView.Adapter<GestorServicios.ServicioViewHolder>() {

    class ServicioViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNombreServicio: TextView = view.findViewById(R.id.tvNombreServicio)
        val tvPrecioBadge: TextView = view.findViewById(R.id.tvPrecioBadge)
        val tvPaciente: TextView = view.findViewById(R.id.tvPaciente)
        val tvTipo: TextView = view.findViewById(R.id.tvTipo)
        val tvDiagnostico: TextView = view.findViewById(R.id.tvDiagnostico)
        val tvProcedimiento: TextView = view.findViewById(R.id.tvProcedimiento)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ServicioViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.gestor_servicios, parent, false)
        return ServicioViewHolder(view)
    }

    //Mismas columnas que la tabla de ServicioCore: Paciente, Servicio, Tipo, ID Diagnóstico, Precio Aplicado
    override fun onBindViewHolder(holder: ServicioViewHolder, position: Int) {
        val s = lista[position]

        holder.tvNombreServicio.text = s.nombre_servicio
        holder.tvPrecioBadge.text = formatoPrecio(s.precio_aplicado)
        holder.tvPaciente.text = "Paciente: ${if (s.nombre_paciente.isNullOrBlank()) "N/A" else s.nombre_paciente}"
        holder.tvTipo.text = "Tipo: ${obtenerNombreTipo(s.id_tipo_servicio)}"
        holder.tvDiagnostico.text = "ID Diagnóstico: ${s.id_diagnostico}"
        holder.tvProcedimiento.text = "Procedimiento: ${if (s.procedimiento.isBlank()) "—" else s.procedimiento}"

        holder.itemView.setOnClickListener { onClickServicio(s) }
    }

    override fun getItemCount(): Int = lista.size

    fun actualizarLista(nuevaLista: List<Servicio>) {
        lista = nuevaLista
        notifyDataSetChanged()
    }
}
