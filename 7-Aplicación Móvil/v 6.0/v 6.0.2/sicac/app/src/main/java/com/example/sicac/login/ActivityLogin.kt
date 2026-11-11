package com.example.sicac.login

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.example.sicac.R
import com.example.sicac.menu.ActivityMenu
import com.example.sicac.viewmodel.AuthUiState
import com.example.sicac.viewmodel.AuthViewModel
import com.example.sicac.viewmodel.AuthViewModelFactory
import kotlinx.coroutines.launch

class ActivityLogin : AppCompatActivity() {
    private val viewModel: AuthViewModel by viewModels {
        AuthViewModelFactory(applicationContext)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.login)

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnIngresar = findViewById<Button>(R.id.btnIngresar)
        val progressBar = findViewById<ProgressBar>(R.id.progressBar)

        btnIngresar.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            //Si uno de los campos esta en blanco o vacío
            if (email.isBlank() || password.isBlank()) {
                Toast.makeText(this, "Completa todos los campos", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            //son 3 lineas de cod para que al dar clic se dirija al menu

            viewModel.login(email, password)
        }

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    when (state) {
                        is AuthUiState.Loading -> {
                            btnIngresar.isEnabled = false
                            btnIngresar.text = "Ingresando..."
                            progressBar.visibility = android.view.View.VISIBLE //Esto para activar el progreesBar
                        }
                        is AuthUiState.Success -> {
                            progressBar.visibility = android.view.View.GONE //Esto lo vuelve a ocultar
                            Toast.makeText(this@ActivityLogin, "¡Bienvenido!", Toast.LENGTH_SHORT).show()
                            val intent = Intent(this@ActivityLogin, ActivityMenu::class.java)
                            startActivity(intent)
                            finish()
                        }

                        is AuthUiState.Error -> {
                            btnIngresar.isEnabled = true
                            btnIngresar.text = "Ingresar"
                            progressBar.visibility = android.view.View.GONE
                            Toast.makeText(this@ActivityLogin, state.message, Toast.LENGTH_LONG).show()
                        }

                        is AuthUiState.Idle -> {
                            btnIngresar.isEnabled = true
                            btnIngresar.text = "Ingresar"
                            progressBar.visibility = android.view.View.GONE
                        }
                    }
                }
            }
        }
    }
}