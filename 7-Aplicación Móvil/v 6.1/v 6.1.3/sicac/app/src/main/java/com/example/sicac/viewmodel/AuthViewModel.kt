package com.example.sicac.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.sicac.data.LoginRepository
import com.example.sicac.data.local.TokenManager
import com.example.sicac.data.remote.models.UsuarioData
import com.example.sicac.data.remote.models.UsuarioMultiRolData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface AuthUiState {
    object Idle : AuthUiState
    object Loading : AuthUiState
    //Registro incompleto (usuario sin perfil en paciente/medico)
    data class RegistroIncompleto(val usuario: UsuarioData) : AuthUiState
    data class Error(val message: String) : AuthUiState
    //Múltiples roles asignados
    data class ElegirRol(val usuarioReal: UsuarioMultiRolData) : AuthUiState
    //Un solo rol
    data class Success(val usuario: UsuarioData) : AuthUiState
}

class AuthViewModel(private val repository: LoginRepository, private val tokenManager: TokenManager) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading

            val resultado = repository.login(email, password)

            if (resultado.isSuccess) {
                val data = resultado.getOrNull()

                if (data == null) {
                    _uiState.value = AuthUiState.Error("Respuesta vacía del servidor")
                    return@launch
                }

                //Verifica si es un registro incompleto
                if (data.registroIncompleto && data.usuario != null) {
                    _uiState.value = AuthUiState.RegistroIncompleto(data.usuario)
                    return@launch
                }

                if (data.token.isNotEmpty()) {
                    tokenManager.saveToken(data.token) //Guardamos el token JWT independiente de si es un rol único o multirol
                }

                //Verifica si tiene múltiples roles el usuario que se logueara
                if (data.elegirRol && data.usuarioReal != null) {
                    _uiState.value = AuthUiState.ElegirRol(data.usuarioReal)
                    return@launch
                }

                //Ingresa directamente si solo tiene asignado un rol
                if (data.usuario != null) {
                    _uiState.value = AuthUiState.Success(data.usuario)
                } else {
                    _uiState.value = AuthUiState.Error("Datos de usuario incompletos")
                }

            } else {
                //Obtenemos la excepción del fallo de manera segura
                val error = resultado.exceptionOrNull()
                _uiState.value = AuthUiState.Error(error?.message ?: "Error desconocido")
            }
        }
    }
    //Esto es para limpiar el estado cuando se cierra un modal o se cancela la selección en la opcion de multirol
    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }
}