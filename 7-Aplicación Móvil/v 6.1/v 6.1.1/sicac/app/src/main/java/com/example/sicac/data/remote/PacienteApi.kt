package com.example.sicac.data.remote

import com.example.sicac.data.remote.models.Paciente
import com.example.sicac.data.remote.models.PacienteUpdateResponse
import com.example.sicac.data.remote.models.TipoDocumento
import retrofit2.Response
import retrofit2.http.*

//Este es como el menú de peticiones
interface PacienteApi {

    //Le indican a Retrofit que haga una petición GET acompañado de la direccion, osea https://../api/paciente -> en este caso
    @GET("paciente")
    suspend fun obtenerPacientes(): Response<List<Paciente>>

    @GET("tipo_documento")
    suspend fun obtenerTiposDocumento(): Response<List<TipoDocumento>>

    @PUT("paciente/{id}")
    suspend fun actualizarPaciente(
        @Path("id") id: Int,
        @Body paciente: Paciente
    ): Response<PacienteUpdateResponse>
}