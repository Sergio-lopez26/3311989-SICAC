package com.example.sicac.ui

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.sicac.R
import com.example.sicac.data.remote.models.Paciente

class GestorPacientes (
    private var lista: List<Paciente>,
    private val obtenerSigla: (Int) -> String,
    private val onClickPaciente: (Paciente) -> Unit
) : RecyclerView.Adapter<GestorPacientes.PacienteViewHolder>() {
    //Este RecycleView es un componente oficial de Android para mostrar listas largas y dinámicas de datos
    //Es como un pacientesFiltrados.map(...) en el React pero optimizado para celulares.

    class PacienteViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvNombreCompleto: TextView = view.findViewById(R.id.tvNombreCompleto)
        val tvEstadoBadge: TextView = view.findViewById(R.id.tvEstadoBadge)
        val tvDocumento: TextView = view.findViewById(R.id.tvDocumento)
        val tvContacto: TextView = view.findViewById(R.id.tvContacto)
        val tvDatosMedicos: TextView = view.findViewById(R.id.tvDatosMedicos)
        val tvAcudiente: TextView = view.findViewById(R.id.tvAcudiente)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PacienteViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.gestor_pacientes, parent, false)
        return PacienteViewHolder(view)
    }

    override fun onBindViewHolder(holder: PacienteViewHolder, position: Int) {
        val p = lista[position]
        val nombre2 = if (p.segundo_nombre.isNullOrBlank()) "" else " ${p.segundo_nombre}"
        val apellido2 = if (p.segundo_apellido.isNullOrBlank()) "" else " ${p.segundo_apellido}"

        holder.tvNombreCompleto.text = "${p.primer_nombre}$nombre2 ${p.primer_apellido}$apellido2"
        holder.tvDocumento.text = "ID: ${p.id} | ${obtenerSigla(p.id_tipo_documento)}: ${p.numero_documento}"
        holder.tvContacto.text = "${p.email} • Cel: ${p.numero_celular}"
        holder.tvDatosMedicos.text = "Sangre: ${p.tipo_sangre} | ${p.genero} | Nac: ${p.fecha_nacimiento}"

        val acudiente = if (p.nombre_acudiente.isNullOrBlank()) {
            "Ninguno"
        } else {
            "${p.nombre_acudiente} (${p.documento_acudiente ?: "S/N"})"
        }
        holder.tvAcudiente.text = "Acudiente: $acudiente"

        holder.tvEstadoBadge.text = p.estado_paciente
        holder.tvEstadoBadge.setBackgroundColor(
            if (p.estado_paciente == "Activo") Color.parseColor("#198754") else Color.parseColor("#DC3545")
        )

        holder.itemView.setOnClickListener { onClickPaciente(p) }
    }

    override fun getItemCount(): Int = lista.size

    fun actualizarLista(nuevaLista: List<Paciente>) {
        lista = nuevaLista
        notifyDataSetChanged()
    }
}