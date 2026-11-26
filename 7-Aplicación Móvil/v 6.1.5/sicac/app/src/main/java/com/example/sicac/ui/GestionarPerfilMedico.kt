package com.example.sicac.ui

import android.app.AlertDialog
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.core.widget.NestedScrollView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
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
class GestionarPerfilMedico : Fragment() {
    //Conecta con los métodos de la API
    private val apiService: MedicoApi by lazy {
        RetrofitClient.getClient(requireContext()).create(MedicoApi::class.java)
    }

    private var tiposDoc: List<TipoDocumento> = emptyList()
    private var medicoActual: Medico? = null //Acá va el médico logueado

    private lateinit var scrollPerfilMedico: NestedScrollView
    private lateinit var cardFormularioPerfilM: MaterialCardView
    private lateinit var btnActualizar: Button
    private lateinit var btnCancelar: Button

    // Campos del formulario
    private lateinit var etTipoDocumento: TextInputEditText
    private lateinit var etNumeroDocumento: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var tilPassword: TextInputLayout
    private lateinit var etPassword: TextInputEditText
    private lateinit var etNombres: TextInputEditText
    private lateinit var etApellidos: TextInputEditText
    private lateinit var etMatriculaProfesional: TextInputEditText
    private lateinit var etNumeroCelular: TextInputEditText
    private lateinit var etFechaRegistro: TextInputEditText
    private lateinit var etEstadoMedico: TextInputEditText
    private lateinit var etBusqueda: TextInputEditText

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_perfil_medico, container, false)
    }
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        enlazarVistas(view)
        cargarPerfilUsuario()

        btnActualizar.setOnClickListener {
            actualizar()
        }

        btnCancelar.setOnClickListener {
            medicoActual?.let { medico ->
                llenarFormulario(medico)
                tilPassword.error = null
                Toast.makeText(requireContext(), "Cambios descartados", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun enlazarVistas(view: View) {
        scrollPerfilMedico = view.findViewById(R.id.scrollPerfilMedico)
        cardFormularioPerfilM = view.findViewById(R.id.cardFormularioPerfilM)
        btnActualizar = view.findViewById(R.id.btnActualizar)
        btnCancelar = view.findViewById(R.id.btnCancelar)

        etTipoDocumento = view.findViewById(R.id.etTipoDocumento)
        etNumeroDocumento = view.findViewById(R.id.etNumeroDocumento)
        etEmail = view.findViewById(R.id.etEmail)
        tilPassword = view.findViewById(R.id.tilPassword)
        etPassword = view.findViewById(R.id.etPassword)
        etNombres = view.findViewById(R.id.etNombres)
        etApellidos = view.findViewById(R.id.etApellidos)
        etMatriculaProfesional = view.findViewById(R.id.etMatriculaProfesional)
        etNumeroCelular = view.findViewById(R.id.etNumeroCelular)
        etFechaRegistro = view.findViewById(R.id.etFechaRegistro)
        etNumeroCelular = view.findViewById(R.id.etNumeroCelular)
        etEstadoMedico = view.findViewById(R.id.etEstadoMedico)
        etBusqueda = view.findViewById(R.id.etBusquedaMedico)
    }

    private fun cargarPerfilUsuario() {
        ////Se extrae el ID desde el ActivityLogin
        val prefs = requireContext().getSharedPreferences("usuario_sesion", android.content.Context.MODE_PRIVATE)
        val idUsuarioLogueado = prefs.getInt("id", -1)

        if (idUsuarioLogueado == -1) {
            Toast.makeText(requireContext(), "No se encontró sesión activa", Toast.LENGTH_SHORT).show()
            return
        }

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                //Acá van los métodos reales de MedicoApi
                //Deferred representa una promesa de un resultado a futuro
                val tiposDeferred = async { apiService.obtenerTiposDocumento() }
                val medicoDeferred = async { apiService.obtenerMedicos() }

                val resTipos = tiposDeferred.await()
                val resMedico = medicoDeferred.await()

                if (resTipos.isSuccessful) {
                    tiposDoc = resTipos.body() ?: emptyList()
                }

                if (resMedico.isSuccessful && resMedico.body() != null) {
                    val listaMedicos: List<Medico> = resMedico.body()!!

                    medicoActual = listaMedicos.find { it.id_usuario == idUsuarioLogueado }

                    if (medicoActual != null) {
                        llenarFormulario(medicoActual!!)
                    } else {
                        Toast.makeText(requireContext(), "No se encontraron datos de medico", Toast.LENGTH_SHORT)
                            .show()
                    }
                } else {
                    Toast.makeText(
                        requireContext(),
                        "Error al cargar datos (${resMedico.code()})",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error de conexión: ${e.message}", Toast.LENGTH_SHORT).show()

            }
        }
    }

    private fun llenarFormulario(m: Medico) {
        val tiposDocs = tiposDoc.find { it.id == m.id_tipo_documento }
        val siglaDoc = if(tiposDocs != null){
            "${tiposDocs.sigla} - ${tiposDocs.nombre_documento}"
        }else{
            "N/A"
        }
        etTipoDocumento.setText(siglaDoc)

        etNumeroDocumento.setText(m.numero_documento)
        etEmail.setText(m.email)
        etPassword.setText("")
        etNombres.setText(m.nombres)
        etApellidos.setText(m.apellidos)
        etMatriculaProfesional.setText(m.matricula_profesional)
        etNumeroCelular.setText(m.numero_celular)
        etFechaRegistro.setText(m.fecha_registro)
        etEstadoMedico.setText(m.estado_medico)
    }

    private fun actualizar() {
        val actual = medicoActual ?: return
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

        val medicoActualizado = actual.copy(
            id_tipo_documento = actual.id_tipo_documento,
            numero_documento = etNumeroDocumento.text.toString().trim(),
            email = etEmail.text.toString().trim(),
            password = if (pass.isEmpty()) null else pass,
            nombres = etNombres.text.toString().trim(),
            apellidos = etApellidos.text.toString().trim(),
            matricula_profesional = etMatriculaProfesional.text.toString().trim(),
            numero_celular = etNumeroCelular.text.toString().trim(),
            fecha_registro = etFechaRegistro.text.toString().trim(),
            estado_medico = etEstadoMedico.text.toString()
        )

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = apiService.actualizarMedico(actual.id, medicoActualizado)
                if (res.isSuccessful) {
                    medicoActual = medicoActualizado
                    etPassword.setText("") //Para limpiar el campo tras guardar
                    AlertDialog.Builder(requireContext())
                        .setTitle("¡Médico Actualizado!")
                        .setMessage("Sus datos han sido actualizados en el sistema exitosamente.")
                        .setCancelable(false)
                        .setPositiveButton("Continuar", null)
                        .show()
                } else {
                    Toast.makeText(requireContext(), "Error al actualizar (${res.code()})", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error en el servidor: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}