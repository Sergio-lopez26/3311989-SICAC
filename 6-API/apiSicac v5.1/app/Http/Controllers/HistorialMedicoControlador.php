<?php

namespace App\Http\Controllers;

use App\Models\HistorialMedico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HistorialMedicoControlador extends Controller
{
    public function index()
    {
        $historial_medico = HistorialMedico::all();
        if ($historial_medico->isEmpty()) {
            return response()->json(['message' => 'No se encontraron historiales médicos'], 404);
        } else {
            return response()->json($historial_medico);
        }
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_paciente' => 'required|exists:paciente,id',
            'antecedentes_medicos' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error de validación'], 422);
        }else{
        $historial_medico = HistorialMedico::create($request->all());
        return response()->json($historial_medico, 201);
        }
    }
    public function show($id)
    {
        $historial_medico = HistorialMedico::where('id_paciente', $id)->get();
        if ($historial_medico->isEmpty()) {
            return response()->json(['message' => 'Historial médico no encontrado'], 404);
        } else {
            return response()->json($historial_medico);
        }
    }
    public function update(Request $request, $id)
    {
        $historial_medico = HistorialMedico::find($id);
        if ($historial_medico) {
            $historial_medico->update($request->all());
            return response()->json($historial_medico);
        } else {
            return response()->json(['message' => 'Historial médico no encontrado'], 404);
        }
    }
}