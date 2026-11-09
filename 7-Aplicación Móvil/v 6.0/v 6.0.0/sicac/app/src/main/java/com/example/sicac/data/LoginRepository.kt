package com.example.sicac.data

import com.example.sicac.data.LoginDataSource
import org.json.JSONObject
import kotlin.Result // Aseguramos la importación nativa de Kotlin

class LoginRepository(private val dataSource: LoginDataSource) {

    suspend fun login(email: String, password: String): Result<String> {
        return try {
            // Llamamos a la API mediante el DataSource
            val response = dataSource.loginUser(email, password)

            //Si esta bien, capturamos el tokem tambien
            if (response.isSuccessful) {
                val bodyString = response.body()?.string()
                val token = try {
                    val jsonObject = JSONObject(bodyString ?: "")
                    val dataObject = jsonObject.getJSONObject("data")
                    dataObject.getString("token")
                } catch (e: Exception) {
                    ""
                }
                // Retornamos el token en lugar de un texto fijo
                Result.success(token)
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