package com.example.sicac.data.remote

import com.example.sicac.data.remote.models.TipoServicio
import com.example.sicac.data.remote.models.TipoServicioResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

// TODO: confirmar las rutas con routes/api.php de Laravel
interface TipoServicioApi {
    // Si no hay registros Laravel responde 404 con un objeto (no una lista vacía)
    @GET("tipo_servicio")
    suspend fun obtenerTiposServicio(): Response<List<TipoServicio>>

    @POST("tipo_servicio")
    suspend fun registrarTipoServicio(@Body tipo: TipoServicio): Response<TipoServicioResponse>

    @PUT("tipo_servicio/{id}")
    suspend fun actualizarTipoServicio(@Path("id") id: Int, @Body tipo: TipoServicio): Response<TipoServicioResponse>
}
