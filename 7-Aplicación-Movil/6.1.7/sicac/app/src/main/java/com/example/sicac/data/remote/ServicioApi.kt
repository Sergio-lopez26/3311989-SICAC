package com.example.sicac.data.remote

import com.example.sicac.data.remote.models.Servicio
import com.example.sicac.data.remote.models.ServicioResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

// TODO: confirmar las rutas con routes/api.php de Laravel
interface ServicioApi {
    // Si no hay registros Laravel responde 404 con un objeto (no una lista vacía)
    @GET("servicio")
    suspend fun obtenerServicios(): Response<List<Servicio>>

    @POST("servicio")
    suspend fun registrarServicio(@Body servicio: Servicio): Response<ServicioResponse>

    @PUT("servicio/{id}")
    suspend fun actualizarServicio(@Path("id") id: Int, @Body servicio: Servicio): Response<ServicioResponse>
}
