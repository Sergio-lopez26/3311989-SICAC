<?php

namespace App\Http\Controllers;

use App\Models\TipoCita;
use Illuminate\Http\Request;

class TipoCitaController extends Controller
{
    /**
     * Leer todos los registros (Read)
     */
    public function index()
    {
        // Obtiene todos los tipos de cita
        $tiposCita = TipoCita::all();
        
        return response()->json($tiposCita, 200);
    }

    /**
     * Crear un nuevo registro (Create)
     */
    public function store(Request $request)
    {
        // Validamos que envíen el campo 'tipo_cita' que definiste en los fillable
        $request->validate([
            'tipo_cita' => 'required|string|max:255',
        ]);

        // Creamos el registro en la base de datos
        $tipoCita = TipoCita::create($request->all());

        return response()->json([
            'mensaje' => 'Tipo de cita creado con éxito',
            'data' => $tipoCita
        ], 201);
    }

    /**
     * Mostrar un registro específico (Read)
     */
    public function show($id)
    {
        // Busca el registro por su ID o devuelve un error 404 si no existe
        $tipoCita = TipoCita::findOrFail($id);

        return response()->json($tipoCita, 200);
    }

    /**
     * Actualizar un registro existente (Update)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'tipo_cita' => 'required|string|max:255',
        ]);

        $tipoCita = TipoCita::findOrFail($id);
        
        // Actualiza el registro con los nuevos datos
        $tipoCita->update($request->all());

        return response()->json([
            'mensaje' => 'Tipo de cita actualizado con éxito',
            'data' => $tipoCita
        ], 200);
    }

    /**
     * Eliminar un registro (Delete)
     */
    public function destroy($id)
    {
        $tipoCita = TipoCita::findOrFail($id);
        
        // Elimina el registro
        $tipoCita->delete();

        return response()->json([
            'mensaje' => 'Tipo de cita eliminado con éxito'
        ], 200);
    }
}