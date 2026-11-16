<?php

namespace App\Http\Controllers;

use App\Models\MetodoPago;
use Illuminate\Http\Request;

class MetodoPagoController extends Controller
{
    /**
     * Leer todos los registros (Read)
     */
    public function index()
    {
        // Obtiene todos los métodos de pago
        $metodos = MetodoPago::all();
        
        return response()->json($metodos, 200);
    }

    /**
     * Crear un nuevo registro (Create)
     */
    public function store(Request $request)
    {
        // Validamos que envíen el nombre del método
        $request->validate([
            'nombre_metodo' => 'required|string|max:255',
        ]);

        // Creamos el registro en la base de datos
        $metodo = MetodoPago::create($request->all());

        return response()->json([
            'mensaje' => 'Método de pago creado con éxito',
            'data' => $metodo
        ], 201);
    }

    /**
     * Mostrar un registro específico (Read)
     */
    public function show($id)
    {
        // Busca el registro por su ID o devuelve un error 404 si no existe
        $metodo = MetodoPago::findOrFail($id);

        return response()->json($metodo, 200);
    }

    /**
     * Actualizar un registro existente (Update)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre_metodo' => 'required|string|max:255',
        ]);

        $metodo = MetodoPago::findOrFail($id);
        
        // Actualiza el registro con los nuevos datos
        $metodo->update($request->all());

        return response()->json([
            'mensaje' => 'Método de pago actualizado con éxito',
            'data' => $metodo
        ], 200);
    }

    /**
     * Eliminar un registro (Delete)
     */
    public function destroy($id)
    {
        $metodo = MetodoPago::findOrFail($id);
        
        // Elimina el registro
        $metodo->delete();

        return response()->json([
            'mensaje' => 'Método de pago eliminado con éxito'
        ], 200);
    }
}