<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route; //Esta libreria es para las rutas
use App\Http\Controllers\RolControlador; //Se importa el controlador de Rol
use App\Http\Controllers\TipoDocumentoControlador; //Se importa el controlador de Tipo Documento
use App\Http\Controllers\UsuarioControlador; //Se importa el controlador de Usuario ... y así sucesivamente
use App\Http\Controllers\PacienteControlador;
use App\Http\Controllers\MedicoControlador;
use App\Http\Controllers\RolUsuarioControlador;
use App\Http\Controllers\MapaDentalControlador;
use App\Http\Controllers\PiezaDentalControlador;
use App\Http\Controllers\ServicioControlador;
use App\Http\Controllers\TipoServicioControlador;
use App\Http\Controllers\Api\AuthController;

//Ruta pública
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['jwt.auth'])->group(function () {

    //Rutas de autenticaión
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('(/me)', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    //Route::apiResource('rol', rolControlador::class); -->Es como una "super ruta", que junta los get, el post, el put y el delete
    //Rol
    Route::get('/rol', [RolControlador::class, 'index']);
    Route::post('/rol', [RolControlador::class, 'store']);
    Route::get('/rol/{id}', [RolControlador::class, 'show']);
    Route::put('/rol/{id}', [RolControlador::class, 'update']);
    Route::delete('/rol/{id}', [RolControlador::class, 'destroy']);

    //Tipo Documento
    Route::get('/tipo_documento', [TipoDocumentoControlador::class, 'index']);
    Route::post('/tipo_documento', [TipoDocumentoControlador::class, 'store']);
    Route::get('/tipo_documento/{id}', [TipoDocumentoControlador::class, 'show']);
    Route::put('/tipo_documento/{id}', [TipoDocumentoControlador::class, 'update']);
    Route::delete('/tipo_documento/{id}', [TipoDocumentoControlador::class, 'destroy']);

    //Usuario
    Route::apiResource('usuario', UsuarioControlador::class); //-->Es como una "super ruta", que junta los get, el post, el put y el delete en uno solo

    //Paciente
    Route::apiResource('paciente', PacienteControlador::class);

    //Medico
    Route::apiResource('medico', MedicoControlador::class);

    //Rol Usuario
    Route::delete('/rol_usuario/{id_rol}/{id_usuario}', [RolUsuarioControlador::class, 'destroy']); //-->Esta ruta ya exige ambos parámetros (id_rol y id_usuario) para eliminar el registro
    Route::apiResource('rol_usuario', RolUsuarioControlador::class)->except(['destroy']); //-->Con el except se evita que se ejecute la ruta delete por defecto

    //Mapa Dental
    Route::apiResource('mapa_dental', MapaDentalControlador::class);

    //Pieza Dental
    Route::apiResource('pieza_dental', PiezaDentalControlador::class);

    //Servicio
    Route::apiResource('servicio', ServicioControlador::class);

    //Tipo Servicio
    Route::apiResource('tipo_servicio', TipoServicioControlador::class);

});