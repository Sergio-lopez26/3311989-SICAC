package com.example.sicac.data.remote

import com.example.sicac.data.remote.models.PiezaDental
import com.example.sicac.data.remote.models.PiezaDentalResponse
import com.example.sicac.data.remote.models.PiezasPorMapaResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

// TODO: confirmar las rutas con routes/api.php de Laravel
interface PiezaDentalApi {
    @GET("pieza_dental/mapa/{idMapa}")
    suspend fun obtenerPiezasPorMapa(@Path("idMapa") idMapa: Int): Response<PiezasPorMapaResponse>

    @POST("pieza_dental")
    suspend fun registrarPieza(@Body pieza: PiezaDental): Response<PiezaDentalResponse>

    @PUT("pieza_dental/{id}")
    suspend fun actualizarPieza(@Path("id") id: Int, @Body pieza: PiezaDental): Response<PiezaDentalResponse>
}
