package com.example.sicac.data

import com.example.sicac.data.LoginDataSource
import org.json.JSONObject
import com.example.sicac.data.remote.models.LoginResponse
import com.google.gson.Gson //Gson convierte todo el JSON de Laravel a lo indicado en el LoginResponse
import kotlin.Result // Aseguramos la importación nativa de Kotlin

class LoginRepository(private val dataSource: LoginDataSource) {

    private val gson = Gson()
    suspend fun login(email: String, password: String): Result<LoginResponse> {
        return try {
            // Llamamos a la API mediante el DataSource
            val response = dataSource.loginUser(email, password)

            //Si esta bien, capturamos el tokem tambien
            if (response.isSuccessful) {
                val bodyString = response.body()?.string() ?: "{}"
                val loginResponse = gson.fromJson(bodyString, LoginResponse::class.java)
                Result.success(loginResponse)
            }else {
                // Capturamos el cuerpo del error en formato String
                val errorString = response.errorBody()?.string()

                // Intentamos parsear el JSON de Laravel para extraer el "message" real
                val mensajeError = try {
                    val jsonObject = JSONObject(errorString ?: "")
                    // Si Laravel manda {"message": "Contraseña incorrecta"}, optString saca ese texto
                    jsonObject.optString("message", "Credenciales inválidas")
                } catch (e: Exception) {
                    "Error en las credenciales"
                }

                Result.failure(Exception(mensajeError))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Error de conexión: ${e.message}"))
        }
    }
}