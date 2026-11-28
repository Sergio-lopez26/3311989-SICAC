package com.example.sicac.data

import okhttp3.OkHttpClient //Con esto se evitas la página de advertencia de ngrok y se le dice a Laravel que siempre responda en JSON.
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

interface LaravelApiService {
    @POST("login") //se añadirá automaticamente después del .../api/
    // Usamos ResponseBody para que acepte la estructura de tokens de Laravel de forma segura
    suspend fun login(@Body credentials: Map<String, String>): Response<ResponseBody>
}

class LoginDataSource {

    private val okHttpClient = OkHttpClient.Builder()
        //Cabecera de ngrok
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("ngrok-skip-browser-warning", "true")
                .addHeader("Accept", "application/json")
                .build()
            chain.proceed(request)
        }
        .build()

    // URL de Ngrok actual
    private val retrofit = Retrofit.Builder()
        .baseUrl("https://swapping-stiffness-slacks.ngrok-free.dev/api/")
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    private val apiService = retrofit.create(LaravelApiService::class.java)

    suspend fun loginUser(email: String, password: String): Response<ResponseBody> {
        val credentials = mapOf("email" to email, "password" to password)
        return apiService.login(credentials)
    }
}
