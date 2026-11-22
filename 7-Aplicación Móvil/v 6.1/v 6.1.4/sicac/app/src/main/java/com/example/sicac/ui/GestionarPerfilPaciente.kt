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
import com.example.sicac.data.remote.models.Paciente
import com.example.sicac.data.remote.models.TipoDocumento
import com.example.sicac.data.remote.PacienteApi
import com.example.sicac.data.remote.RetrofitClient
//Importaciones de diseño
import com.google.android.material.card.MaterialCardView
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
//Corrutinas para tareas pesadas
import kotlinx.coroutines.async
import kotlinx.coroutines.launch

class GestionarPerfilPaciente : Fragment() {

    //Conecta con los métodos de la API
    private val apiService: PacienteApi by lazy {
        RetrofitClient.getClient(requireContext()).create(PacienteApi::class.java)
    }

    private var tiposDoc: List<TipoDocumento> = emptyList()
    private var pacienteActual: Paciente? = null //Acá va el paciente logueado

    private lateinit var scrollPerfilPaciente: NestedScrollView
    private lateinit var cardFormularioPerfilP: MaterialCardView
    private lateinit var btnActualizar: Button
    private lateinit var btnCancelar: Button

    // Campos del formulario
    private lateinit var etTipoDocumento: TextInputEditText
    private lateinit var etNumeroDocumento: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var tilPassword: TextInputLayout
    private lateinit var etPassword: TextInputEditText
    private lateinit var etPrimerNombre: TextInputEditText
    private lateinit var etSegundoNombre: TextInputEditText
    private lateinit var etPrimerApellido: TextInputEditText
    private lateinit var etSegundoApellido: TextInputEditText
    private lateinit var etFechaNacimiento: TextInputEditText
    private lateinit var etNumeroCelular: TextInputEditText
    private lateinit var etTipoSangre: TextInputEditText
    private lateinit var etGenero: TextInputEditText
    private lateinit var etNombreAcudiente: TextInputEditText
    private lateinit var etDocumentoAcudiente: TextInputEditText
    private lateinit var etEstadoPaciente: TextInputEditText
    private lateinit var etBusqueda: TextInputEditText

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.gestionar_perfil_paciente, container, false)
    }
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        enlazarVistas(view)
        cargarPerfilUsuario()

        btnActualizar.setOnClickListener {
            actualizar()
        }

        btnCancelar.setOnClickListener {
            pacienteActual?.let { paciente ->
                llenarFormulario(paciente)
                tilPassword.error = null
                Toast.makeText(requireContext(), "Cambios descartados", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun enlazarVistas(view: View) {
        scrollPerfilPaciente = view.findViewById(R.id.scrollPerfilPaciente)
        cardFormularioPerfilP = view.findViewById(R.id.cardFormularioPerfilP)
        btnActualizar = view.findViewById(R.id.btnActualizar)
        btnCancelar = view.findViewById(R.id.btnCancelar)

        etTipoDocumento = view.findViewById(R.id.etTipoDocumento)
        etNumeroDocumento = view.findViewById(R.id.etNumeroDocumento)
        etEmail = view.findViewById(R.id.etEmail)
        tilPassword = view.findViewById(R.id.tilPassword)
        etPassword = view.findViewById(R.id.etPassword)
        etPrimerNombre = view.findViewById(R.id.etPrimerNombre)
        etSegundoNombre = view.findViewById(R.id.etSegundoNombre)
        etPrimerApellido = view.findViewById(R.id.etPrimerApellido)
        etSegundoApellido = view.findViewById(R.id.etSegundoApellido)
        etFechaNacimiento = view.findViewById(R.id.etFechaNacimiento)
        etNumeroCelular = view.findViewById(R.id.etNumeroCelular)
        etTipoSangre = view.findViewById(R.id.etTipoSangre)
        etGenero = view.findViewById(R.id.etGenero)
        etNombreAcudiente = view.findViewById(R.id.etNombreAcudiente)
        etDocumentoAcudiente = view.findViewById(R.id.etDocumentoAcudiente)
        etEstadoPaciente = view.findViewById(R.id.etEstadoPaciente)
        etBusqueda = view.findViewById(R.id.etBusquedaPaciente)
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
                //Acá van los métodos reales de PacienteApi
                //Deferred representa una promesa de un resultado a futuro
                val tiposDeferred = async { apiService.obtenerTiposDocumento() }
                val pacienteDeferred = async { apiService.obtenerPacientes() }

                val resTipos = tiposDeferred.await()
                val resPaciente = pacienteDeferred.await()

                if (resTipos.isSuccessful) {
                    tiposDoc = resTipos.body() ?: emptyList()
                }

                if (resPaciente.isSuccessful && resPaciente.body() != null) {
                    val listaPacientes: List<Paciente> = resPaciente.body()!!

                    pacienteActual = listaPacientes.find { it.id_usuario == idUsuarioLogueado }

                    if (pacienteActual != null) {
                        llenarFormulario(pacienteActual!!)
                    } else {
                        Toast.makeText(requireContext(), "No se encontraron datos de paciente", Toast.LENGTH_SHORT)
                            .show()
                    }
                } else {
                    Toast.makeText(
                        requireContext(),
                        "Error al cargar datos (${resPaciente.code()})",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error de conexión: ${e.message}", Toast.LENGTH_SHORT).show()

            }
        }
    }

    private fun llenarFormulario(p: Paciente) {
        val tiposDocs = tiposDoc.find { it.id == p.id_tipo_documento }
        val siglaDoc = if(tiposDocs != null){
            "${tiposDocs.sigla} - ${tiposDocs.nombre_documento}"
        }else{
            "N/A"
        }
        etTipoDocumento.setText(siglaDoc)

        etNumeroDocumento.setText(p.numero_documento)
        etEmail.setText(p.email)
        etPassword.setText("")
        etPrimerNombre.setText(p.primer_nombre)
        etSegundoNombre.setText(p.segundo_nombre)
        etPrimerApellido.setText(p.primer_apellido)
        etSegundoApellido.setText(p.segundo_apellido)
        etFechaNacimiento.setText(p.fecha_nacimiento)
        etNumeroCelular.setText(p.numero_celular)
        etTipoSangre.setText(p.tipo_sangre)
        etGenero.setText(p.genero)
        etNombreAcudiente.setText(p.nombre_acudiente)
        etDocumentoAcudiente.setText(p.documento_acudiente)
        etEstadoPaciente.setText(p.estado_paciente)
    }

    private fun actualizar() {
        val actual = pacienteActual ?: return
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

        val pacienteActualizado = actual.copy(
            id_tipo_documento = actual.id_tipo_documento,
            numero_documento = etNumeroDocumento.text.toString().trim(),
            email = etEmail.text.toString().trim(),
            password = if (pass.isEmpty()) null else pass,
            primer_nombre = etPrimerNombre.text.toString().trim(),
            segundo_nombre = etSegundoNombre.text.toString().trim(),
            primer_apellido = etPrimerApellido.text.toString().trim(),
            segundo_apellido = etSegundoApellido.text.toString().trim(),
            fecha_nacimiento = etFechaNacimiento.text.toString().trim(),
            numero_celular = etNumeroCelular.text.toString().trim(),
            tipo_sangre = etTipoSangre.text.toString(),
            genero = etGenero.text.toString(),
            nombre_acudiente = etNombreAcudiente.text.toString().trim(),
            documento_acudiente = etDocumentoAcudiente.text.toString().trim(),
            estado_paciente = etEstadoPaciente.text.toString()
        )

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val res = apiService.actualizarPaciente(actual.id, pacienteActualizado)
                if (res.isSuccessful) {
                    pacienteActual = pacienteActualizado
                    etPassword.setText("") //Para limpiar el campo tras guardar
                    AlertDialog.Builder(requireContext())
                        .setTitle("¡Paciente Actualizado!")
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