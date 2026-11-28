package com.example.sicac.data.remote

import com.example.sicac.data.remote.models.MapaDental
import com.example.sicac.data.remote.models.MapaDentalResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

// TODO: confirmar las rutas con routes/api.php de Laravel
interface MapaDentalApi {
    // Si no hay registros Laravel responde 404 con un objeto (no una lista vacía)
    @GET("mapa_dental")
    suspend fun obtenerMapas(): Response<List<MapaDental>>

    @POST("mapa_dental")
    suspend fun registrarMapa(@Body mapa: MapaDental): Response<MapaDentalResponse>

    @PUT("mapa_dental/{id}")
    suspend fun actualizarMapa(@Path("id") id: Int, @Body mapa: MapaDental): Response<MapaDentalResponse>
}
