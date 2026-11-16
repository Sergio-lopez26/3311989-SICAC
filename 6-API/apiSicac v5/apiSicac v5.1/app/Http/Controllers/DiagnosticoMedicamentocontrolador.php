<?php

namespace App\Http\Controllers;

use App\Models\DiagnosticoMedicamento;
use Illuminate\Http\Request;

class DiagnosticoMedicamentocontrolador extends Controller
{
    public function index()
    {
        $diagnosticoMedicamentos = DiagnosticoMedicamento::all();
        if ($diagnosticoMedicamentos->isEmpty()) {
            return response()->json(['message' => 'No se encontraron registros de diagnóstico-medicamento'], 404);
        } else {
            return response()->json($diagnosticoMedicamentos, 200);
        }
    }
    public function store(Request $request)
    {
        $diagnosticoMedicamento = DiagnosticoMedicamento::create($request->all());
        return response()->json($diagnosticoMedicamento, 201);
    }
    public function show($id_diagnostico, $id_medicamento)
    {
        $diagnosticoMedicamento = DiagnosticoMedicamento::where('id_diagnostico', $id_diagnostico)
            ->where('id_medicamento', $id_medicamento)
            ->first();
        if ($diagnosticoMedicamento) {
            return response()->json($diagnosticoMedicamento, 200);
        } else {
            return response()->json(['message' => 'Registro de diagnóstico-medicamento no encontrado'], 404);
        }
    }
    public function update(Request $request, $id_diagnostico, $id_medicamento)
{
    $existe = DiagnosticoMedicamento::where('id_diagnostico', $id_diagnostico)
        ->where('id_medicamento', $id_medicamento)
        ->exists();

    if (!$existe) {
        return response()->json(['message' => 'Registro diagnóstico-medicamento no encontrado'], 404);
    }

    DiagnosticoMedicamento::where('id_diagnostico', $id_diagnostico)
        ->where('id_medicamento', $id_medicamento)
        ->update($request->except(['id_diagnostico', 'id_medicamento']));

    $diagnosticoMedicamento = DiagnosticoMedicamento::where('id_diagnostico', $id_diagnostico)
        ->where('id_medicamento', $id_medicamento)
        ->first();

    return response()->json($diagnosticoMedicamento, 200);
}
    function destroy($id_diagnostico, $id_medicamento)
    {
        $existe = DiagnosticoMedicamento::where('id_diagnostico',$id_diagnostico)
        ->where('id_medicamento',$id_medicamento)
        ->exists();
        if(!$existe){
            return response()->json("no se encontro el diagnostico medicamento");
        }
        DiagnosticoMedicamento::where('id_diagnostico',$id_diagnostico)
        ->where('id_medicamento',$id_medicamento)
        ->delete();
        return response()->json("eliminado exitosamente");
    }
}
