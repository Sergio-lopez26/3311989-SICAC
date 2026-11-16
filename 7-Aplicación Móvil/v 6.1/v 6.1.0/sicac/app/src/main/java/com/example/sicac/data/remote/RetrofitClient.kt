package com.example.sicac.data.remote

import android.content.Context
import com.example.sicac.data.local.TokenManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    // IMPORTANTE: Oigan, acá se coloca la IP de la PC actual
    //private const val BASE_URL = "http://192.168.20.35:8000/api/"
    // URL Ngrok
    private const val BASE_URL = "https://agreement-cosmic-octane.ngrok-free.dev/api/"
    fun getClient(context: Context? = null): Retrofit {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor { chain ->
                val requestBuilder = chain.request().newBuilder()
                    .addHeader("Accept", "application/json")
                    .addHeader("ngrok-skip-browser-warning", "true")

                // Leemos el token JWT guardado por TokenManager al hacer login
                val token = context?.let { TokenManager(it).getToken() }
                if (!token.isNullOrEmpty()) {
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }

                chain.proceed(requestBuilder.build())
            }

            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}

