<?php

namespace App\Http\Controllers;

use App\Models\TipoMedicamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TipoMedicamentoControlador extends Controller
{
    public function index()
    {
        $tipos = TipoMedicamento::all();
        if ($tipos->isEmpty()) {
            return response()->json(['message' => 'No se encontraron tipos de medicamentos'], 404);
        }else{
        return response()->json($tipos, 200);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'categoria_medicamento' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error de validación'], 422);
        }else{
        $tipo = TipoMedicamento::create($request->all());
        return response()->json($tipo, 201);
        }
    }

    public function show($id)
    {
        $tipo = TipoMedicamento::find($id);
        if ($tipo) {
            return response()->json($tipo, 200);
        } else {
            return response()->json(['message' => 'Tipo de medicamento no encontrado'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $tipo = TipoMedicamento::find($id);
        if ($tipo) {
            $tipo->update($request->all());
            return response()->json($tipo, 200);
        } else {
            return response()->json(['message' => 'Tipo de medicamento no encontrado'], 404);
        }
    }

    public function destroy($id)
    {
        $tipo = TipoMedicamento::find($id);
        if ($tipo) {
            $tipo->delete();
            return response()->json(['message' => 'Eliminado exitosamente'], 200);
        } else {
            return response()->json(['message' => 'Tipo de medicamento no encontrado'], 404);
        }
    }
}
