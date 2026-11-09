package com.example.sicac.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.sicac.data.LoginDataSource
import com.example.sicac.data.LoginRepository
import com.example.sicac.data.local.TokenManager

class AuthViewModelFactory(private val context: Context) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AuthViewModel::class.java)) {
            val dataSource = LoginDataSource()
            val repository = LoginRepository(dataSource)
            val tokenManager = TokenManager(context)
            @Suppress("UNCHECKED_CAST")
            return AuthViewModel(repository, tokenManager) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}



