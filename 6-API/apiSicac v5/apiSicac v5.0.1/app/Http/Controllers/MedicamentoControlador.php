<?php

namespace App\Http\Controllers;

use App\Models\Medicamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MedicamentoControlador extends Controller
{
    public function index()
    {
        $medicamentos = Medicamento::all();
        if ($medicamentos->isEmpty()) {
            return response()->json(['message' => 'No se encontraron medicamentos'], 404);
        } else {
            return response()->json($medicamentos, 200);
        }
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_tipo_medicamento' => 'required|exists:tipo_medicamento,id',
            'nombre_medicamento' => 'required|string|max:255'
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Error de validación'], 422);
        }else{
        $medicamento = Medicamento::create($request->all());
        return response()->json($medicamento, 201);
        }
    }
    public function show($id)
    {
        $medicamento = Medicamento::find($id);
        if ($medicamento) {
            return response()->json($medicamento, 200);
        } else {
            return response()->json(['message' => 'Medicamento no encontrado'], 404);
        }
    }
    public function update(Request $request, $id)
    {
        $medicamento = Medicamento::find($id);
        if ($medicamento) {
            $medicamento->update($request->all());
            return response()->json($medicamento, 200);
        } else {
            return response()->json(['message' => 'Medicamento no encontrado'], 404);
        }
    }
    public function destroy($id)
    {
        $medicamento = Medicamento::find($id);
        if ($medicamento) {
            $medicamento->delete();
            return response()->json(['message' => 'Medicamento eliminado'], 200);
        } else {
            return response()->json(['message' => 'Medicamento no encontrado'], 404);
        }
    }
}
