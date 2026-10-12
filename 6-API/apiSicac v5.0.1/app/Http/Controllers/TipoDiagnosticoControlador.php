<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TipoDiagnostico;
use Illuminate\Support\Facades\Validator;

class TipoDiagnosticoControlador extends Controller
{
    public function index()
    {
        $tipoDiagnosticos = TipoDiagnostico::all();
        if ($tipoDiagnosticos->isEmpty()) {
            return response()->json(['message' => 'No se encontraron tipos de diagnóstico'], 404);
        } else {
            return response()->json($tipoDiagnosticos, 200);
        }
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre_diagnostico' => 'required|string',
            'descripcion' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Error de validación'], 422);
        }else{
        $tipoDiagnostico = TipoDiagnostico::create($request->all());
        return response()->json($tipoDiagnostico, 201);
        }
    }
    public function show($id)
    {
        $tipoDiagnostico = TipoDiagnostico::find($id);
        if ($tipoDiagnostico) {
            return response()->json($tipoDiagnostico, 200);
        } else {    
            return response()->json(['message' => 'Tipo de diagnóstico no encontrado'], 404);
        }
    }
    public function update(Request $request, $id)
    {
        $tipoDiagnostico = TipoDiagnostico::find($id);
        if ($tipoDiagnostico) {
            $tipoDiagnostico->update($request->all());
            return response()->json($tipoDiagnostico, 200);
        } else {
            return response()->json(['message' => 'Tipo de diagnóstico no encontrado'], 404);
        }
    }
    public function destroy($id)
    {
        $tipoDiagnostico = TipoDiagnostico::find($id);
        if ($tipoDiagnostico) { 
            $tipoDiagnostico->delete();
            return response()->json(['message' => 'Tipo de diagnóstico eliminado'], 200);
        } else {
            return response()->json(['message' => 'Tipo de diagnóstico no encontrado'], 404);
        }
    }
}