package com.example.sicac.ui

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.sicac.R
import com.example.sicac.data.remote.models.Medico

class GestorMedicos (
    private var lista: List<Medico>,
    private val obtenerSigla: (Int) -> String,
    private val onClickMedico: (Medico) -> Unit

) : RecyclerView.Adapter<GestorMedicos.MedicoViewHolder>() {
    //Este RecycleView es un componente oficial de Android para mostrar listas largas y dinámicas de datos
    //Es como un pacientesFiltrados.map(...) en el React pero optimizado para celulares.

    class MedicoViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNombreCompletoM: TextView = view.findViewById(R.id.tvNombreCompletoM)
        val tvEstadoBadgeM: TextView = view.findViewById(R.id.tvEstadoBadgeM)
        val tvDocumentoM: TextView = view.findViewById(R.id.tvDocumentoM)
        val tvContactoM: TextView = view.findViewById(R.id.tvContactoM)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MedicoViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.gestor_medicos, parent, false)
        return MedicoViewHolder(view)
    }

    override fun onBindViewHolder(holder: MedicoViewHolder, position: Int) {
        val p = lista[position]

        holder.tvNombreCompletoM.text = "${p.nombres} ${p.apellidos}"
        holder.tvDocumentoM.text = "ID: ${p.id} | ${obtenerSigla(p.id_tipo_documento)}: ${p.numero_documento}"
        holder.tvContactoM.text = "${p.email} • Cel: ${p.numero_celular}"

        holder.tvEstadoBadgeM.text = p.estado_medico
        holder.tvEstadoBadgeM.setBackgroundColor(
            if (p.estado_medico == "Activo") Color.parseColor("#198754") else Color.parseColor("#DC3545")
        )

        holder.itemView.setOnClickListener { onClickMedico(p) }
    }

    override fun getItemCount(): Int = lista.size

    fun actualizarLista(nuevaLista: List<Medico>) {
        lista = nuevaLista
        notifyDataSetChanged()
    }
}