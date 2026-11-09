package com.example.sicac.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.sicac.data.LoginRepository
import com.example.sicac.data.local.TokenManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface AuthUiState {
    object Idle : AuthUiState
    object Loading : AuthUiState
    data class Success(val username: String) : AuthUiState
    data class Error(val message: String) : AuthUiState
}

class AuthViewModel(private val repository: LoginRepository, private val tokenManager: TokenManager) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading

            val resultado = repository.login(email, password)

            if (resultado.isSuccess) {
                val token = resultado.getOrNull() ?: ""
                if (token.isNotEmpty()) {
                    tokenManager.saveToken(token) //Guardamos el JWT
                }
                _uiState.value = AuthUiState.Success(email)
            } else {
                //Obtenemos la excepción del fallo de manera segura
                val error = resultado.exceptionOrNull()
                _uiState.value = AuthUiState.Error(error?.message ?: "Error desconocido")
            }
        }
    }
}