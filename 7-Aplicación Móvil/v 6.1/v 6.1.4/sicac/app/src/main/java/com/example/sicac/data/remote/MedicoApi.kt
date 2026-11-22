package com.example.sicac.data.remote

import com.example.sicac.data.remote.models.Medico
import com.example.sicac.data.remote.models.MedicoUpdateResponse
import com.example.sicac.data.remote.models.TipoDocumento
import retrofit2.Response
import retrofit2.http.*

interface MedicoApi {
    //Le indicamos a Retrofit que haga una petición GET acompañado de la direccion, osea https://../api/medico -> en este caso
    @GET("medico")
    suspend fun obtenerMedicos(): Response<List<Medico>>

    @GET("tipo_documento")
    suspend fun obtenerTiposDocumento(): Response<List<TipoDocumento>>

    @PUT("medico/{id}")
    suspend fun actualizarMedico(
        @Path("id") id: Int,
        @Body medico: Medico
    ): Response<MedicoUpdateResponse>
}