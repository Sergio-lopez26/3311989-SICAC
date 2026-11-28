package com.example.sicac.data.remote

import com.google.gson.Gson
import retrofit2.Response

// Forma de los errores de Laravel (400 validación, 404, 500)
data class ApiMensaje(
    val message: String? = null,
    val errors: Map<String, List<String>>? = null,
    val status: Int? = null
)

// Devuelve el primer error de validación, o el mensaje general, o el código HTTP
fun <T> Response<T>.mensajeError(): String {
    val crudo = try { errorBody()?.string() } catch (e: Exception) { null }
    val api = try { Gson().fromJson(crudo, ApiMensaje::class.java) } catch (e: Exception) { null }
    val primerError = api?.errors?.values?.firstOrNull()?.firstOrNull()
    return primerError ?: api?.message ?: "Error (${code()})"
}
