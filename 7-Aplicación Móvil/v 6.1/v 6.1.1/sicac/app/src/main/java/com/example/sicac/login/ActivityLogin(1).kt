package com.example.sicac.login

import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList //Para los colores en el "modal"
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate //Para hacer que la app este en modo claro siempre
import androidx.core.text.HtmlCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.example.sicac.R
import com.example.sicac.data.remote.models.UsuarioData
import com.example.sicac.data.remote.models.UsuarioMultiRolData
import com.example.sicac.menu.ActivityMenuAdmin
import com.example.sicac.menu.ActivityMenuMedico
import com.example.sicac.menu.ActivityMenuPaciente
//import com.example.sicac.menu.ActivityMenuMedico
//import com.example.sicac.menu.ActivityMenuPaciente
import com.example.sicac.viewmodel.AuthUiState
import com.example.sicac.viewmodel.AuthViewModel
import com.example.sicac.viewmodel.AuthViewModelFactory
import kotlinx.coroutines.launch

class ActivityLogin : AppCompatActivity() {
    private val viewModel: AuthViewModel by viewModels {
        AuthViewModelFactory(applicationContext)
    }

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnIngresar: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO) //Para hacer que la app este en modo claro siempre
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login)

        etEmail = findViewById<EditText>(R.id.etEmail)
        etPassword = findViewById<EditText>(R.id.etPassword)
        btnIngresar = findViewById<Button>(R.id.btnIngresar)
        progressBar = findViewById<ProgressBar>(R.id.progressBar)

        btnIngresar.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            //Si uno de los campos esta en blanco o vacío
            if (email.isBlank() || password.isBlank()) {
                Toast.makeText(this, "Completa todos los campos", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            //Validación igual al laravel (mínimo 8 caracteres)
            if (password.length < 8) {
                mostrarModalPrecaucion()
                return@setOnClickListener
            }

            viewModel.login(email, password)
        }

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    when (state) {
                        is AuthUiState.Loading -> {
                            btnIngresar.isEnabled = false
                            btnIngresar.text = "Ingresando..."
                            progressBar.visibility = View.VISIBLE //Esto para activar el progreesBar
                        }

                        is AuthUiState.Success -> {
                            restaurarBoton()
                            guardarSesionLocal(
                                id = state.usuario.id,
                                email = state.usuario.email,
                                nombre = state.usuario.nombre_completo,
                                rol = state.usuario.rol
                            )
                            mostrarModalIngresoExitoso(state.usuario.rol)
                        }

                        is AuthUiState.ElegirRol -> {
                            restaurarBoton()
                            mostrarModalElegirRol(state.usuarioReal)
                        }

                        is AuthUiState.RegistroIncompleto -> {
                            restaurarBoton()
                            mostrarModalRegistroIncompleto(state.usuario)
                        }

                        is AuthUiState.Error -> {
                            restaurarBoton()
                            Toast.makeText(this@ActivityLogin, state.message, Toast.LENGTH_LONG).show()
                        }

                        is AuthUiState.Idle -> {
                            restaurarBoton()
                        }
                    }
                }
            }
        }
    }

    private fun restaurarBoton() {
        btnIngresar.isEnabled = true
        btnIngresar.text = "Ingresar"
        progressBar.visibility = View.GONE
    }

    //Equivalente a modal "noValido" -> como lo tenemos en React pero ahora acá
    private fun mostrarModalPrecaucion() {
        AlertDialog.Builder(this)
            .setTitle("¡Precaución!")
            .setMessage("Estimado Usuario. La contraseña debe tener mínimo 8 caracteres")
            .setPositiveButton("Aceptar") { dialog, _ -> dialog.dismiss() }
            .setCancelable(false)
            .show()
    }

    //Tal como arriba pero ahora como el modal "ingreso"
    private fun mostrarModalIngresoExitoso(rol: String) {
        AlertDialog.Builder(this)
            .setTitle("¡Ingreso Exitoso!")
            .setMessage("¡Credenciales Validadas!\nEstimado Usuario. Usted ha ingresado al sistema exitosamente.")
            .setPositiveButton("Continuar") { dialog, _ ->
                dialog.dismiss()
                etEmail.text.clear()
                etPassword.text.clear()
                viewModel.resetState()
                redirigirSegunRol(rol)
            }
            .setCancelable(false)
            .show()
    }

    //Este es como el modal "elegirRol" (aplicando colores Bootstrap y mapeo Odontologo -> Médico -> como en el React lo teníamos)
    private fun mostrarModalElegirRol(usuarioReal: UsuarioMultiRolData) {
        val contenedor = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 24, 48, 8)
        }

        val mensaje = HtmlCompat.fromHtml(
            "Estimado(a) <b>${usuarioReal.nombre_completo}</b>.<br>Su cuenta posee múltiples roles de acceso. ¿Cómo desea ingresar hoy?",
            HtmlCompat.FROM_HTML_MODE_LEGACY
        )

        val dialog = AlertDialog.Builder(this)
            .setTitle("Seleccionar Rol de Ingreso")
            .setMessage(mensaje)
            .setView(contenedor)
            .setNegativeButton("Cancelar") { d, _ ->
                getSharedPreferences("usuario_sesion", Context.MODE_PRIVATE).edit().clear().apply()
                etPassword.text.clear()
                viewModel.resetState()
                d.dismiss()
            }
            .setCancelable(false)
            .create()

        usuarioReal.roles.forEach { rol ->
            val botonRol = Button(this).apply {
                text = if (rol == "Odontologo") "Médico" else rol
                setTextColor(Color.WHITE)
                isAllCaps = false

                val colorHex = when (rol) {
                    "Administrador" -> "#DC3545" //Esto es Rojo
                    "Odontologo"    -> "#0D6EFD" //Esto es Azul
                    else            -> "#198754" //Esto es Verde -> Indica al Paciente
                }
                backgroundTintList = ColorStateList.valueOf(Color.parseColor(colorHex))

                val params = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply {
                    bottomMargin = 16
                }
                layoutParams = params

                setOnClickListener {
                    guardarSesionLocal(usuarioReal.id, usuarioReal.email, usuarioReal.nombre_completo, rol)
                    dialog.dismiss()
                    mostrarModalIngresoExitoso(rol)
                }
            }
            contenedor.addView(botonRol)
        }

        dialog.show()
    }

    //Es commo el modal "registroIncompleto"
    private fun mostrarModalRegistroIncompleto(usuario: UsuarioData) {
        AlertDialog.Builder(this)
            .setTitle("¡Cuenta Existente!")
            .setMessage("Detectamos que ya tiene una cuenta de usuario creada, pero aún no ha completado sus datos personales.\n\n¿Desea continuar con el registro de sus datos como paciente ahora?")
            .setPositiveButton("Sí") { dialog, _ ->
                dialog.dismiss()
                viewModel.resetState()
                Toast.makeText(this, "Continuar registro para: ${usuario.email}", Toast.LENGTH_SHORT).show()
                //Comentado porque no tenemos la vista de ese registros XD
                /*
                val intent = Intent(this, ActivityRegistroPaciente::class.java).apply {
                    putExtra("id_usuario", usuario.id)
                    putExtra("email", usuario.email)
                }
                startActivity(intent)
                */
            }
            .setNegativeButton("No") { dialog, _ ->
                dialog.dismiss()
                etEmail.text.clear()
                etPassword.text.clear()
                viewModel.resetState()
            }
            .setCancelable(false)
            .show()
    }
    //Con esto ya direccionamos hacia cada menú según el rol
    private fun redirigirSegunRol(rol: String) {
        val destino = when (rol) {
            "Administrador" -> ActivityMenuAdmin::class.java
            "Odontologo"    -> ActivityMenuMedico::class.java //Acá iría el de Médcio
            "Paciente"      -> ActivityMenuPaciente::class.java
            else -> {
                Toast.makeText(this, "Rol no reconocido: $rol", Toast.LENGTH_SHORT).show()
                return
            }
        }
        startActivity(Intent(this, destino))
        finish()
    }
    //Acá guardamos la sesión (datos del usuario logueado)
    private fun guardarSesionLocal(id: Int, email: String, nombre: String, rol: String) {
        getSharedPreferences("usuario_sesion", Context.MODE_PRIVATE).edit()
            .putInt("id", id)
            .putString("email", email)
            .putString("nombre_completo", nombre)
            .putString("rol", rol)
            .apply()
    }

}