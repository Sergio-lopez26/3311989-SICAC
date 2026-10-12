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
use App\Http\Controllers\HistorialMedicoControlador;
use App\Http\Controllers\DiagnosticoControlador;
use App\Http\Controllers\MedicamentoControlador;
use App\Http\Controllers\TipoDiagnosticoControlador;
use App\Http\Controllers\DiagnosticoMedicamentocontrolador;
use App\Http\Controllers\TipoMedicamentoControlador;
use App\Http\Controllers\MetodoPagoControlador;
use App\Http\Controllers\TipoCitaControlador;
use App\Http\Controllers\CitaControlador;
use App\Http\Controllers\PagoControlador;

//Route::apiResource('rol', rolControlador::class); -->Es como una "super ruta", que junta los get, el post, el put y el delete
Route::get('/rol', [RolControlador::class, 'index']);
Route::post('/rol', [RolControlador::class, 'store']);
Route::get('/rol/{id}', [RolControlador::class, 'show']);
Route::put('/rol/{id}', [RolControlador::class, 'update']);
Route::delete('/rol/{id}', [RolControlador::class, 'destroy']);

Route::get('/tipo_documento', [TipoDocumentoControlador::class, 'index']);
Route::post('/tipo_documento', [TipoDocumentoControlador::class, 'store']);
Route::get('/tipo_documento/{id}', [TipoDocumentoControlador::class, 'show']);
Route::put('/tipo_documento/{id}', [TipoDocumentoControlador::class, 'update']);
Route::delete('/tipo_documento/{id}', [TipoDocumentoControlador::class, 'destroy']);

Route::apiResource('usuario', UsuarioControlador::class); //-->Es como una "super ruta", que junta los get, el post, el put y el delete en uno solo

Route::apiResource('paciente', PacienteControlador::class);

Route::apiResource('medico', MedicoControlador::class);

Route::delete('/rol_usuario/{id_rol}/{id_usuario}', [RolUsuarioControlador::class, 'destroy']); //-->Esta ruta ya exige ambos parámetros (id_rol y id_usuario) para eliminar el registro
Route::apiResource('rol_usuario', RolUsuarioControlador::class)->except(['destroy']); //-->Con el except se evita que se ejecute la ruta delete por defecto

Route::apiResource('mapa_dental', MapaDentalControlador::class);

Route::apiResource('pieza_dental', PiezaDentalControlador::class);

Route::apiResource('servicio', ServicioControlador::class);

Route::apiResource('tipo_servicio', TipoServicioControlador::class);

Route::get('/historial_medico', [HistorialMedicoControlador::class, 'index']);
Route::get('/historial_medico/{id}', [HistorialMedicoControlador::class, 'show']);
Route::post('/historial_medico', [HistorialMedicoControlador::class, 'store']);
Route::put('/historial_medico/{id}', [HistorialMedicoControlador::class, 'update']);


Route::get('/diagnostico', [DiagnosticoControlador::class, 'index']);
Route::get('/diagnostico/{id}', [DiagnosticoControlador::class, 'show']);
Route::post('/diagnostico', [DiagnosticoControlador::class, 'store']);
Route::put('/diagnostico/{id}', [DiagnosticoControlador::class, 'update']);
Route::get('/diagnostico/cita/{id_cita}', [DiagnosticoControlador::class, 'diagCita']);

Route::apiResource('medicamento', MedicamentoControlador::class);

Route::apiResource('tipo_diagnostico', TipoDiagnosticoControlador::class);

Route::get('/diagnostico_medicamento', [DiagnosticoMedicamentoControlador::class, 'index']);
Route::post('/diagnostico_medicamento', [DiagnosticoMedicamentoControlador::class, 'store']);
Route::get('/diagnostico_medicamento/{id_diagnostico}/{id_medicamento}', [DiagnosticoMedicamentoControlador::class, 'show']);
Route::put('/diagnostico_medicamento/{id_diagnostico}/{id_medicamento}', [DiagnosticoMedicamentoControlador::class, 'update']);
Route::delete('/diagnostico_medicamento/{id_diagnostico}/{id_medicamento}', [DiagnosticoMedicamentoControlador::class, 'destroy']);

Route::apiResource('tipo_medicamento', TipoMedicamentoControlador::class);
Route::apiResource('metodo_pago', MetodoPagoControlador::class);
Route::apiResource('tipo_cita', TipoCitaControlador::class);
Route::apiResource('cita', CitaControlador::class);
Route::get('/pago/agendamiento/{id_agendamiento}', [PagoControlador::class, 'porAgendamiento']);
Route::put('/pago/estado/{id}', [PagoControlador::class, 'marcarPagado']);
Route::apiResource('pago', PagoControlador::class);