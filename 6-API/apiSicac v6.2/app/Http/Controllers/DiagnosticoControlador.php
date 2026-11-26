<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use App\Models\Diagnostico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class DiagnosticoControlador extends Controller
{
    public function index()
    {
        $diagnosticos = Diagnostico::all();
        if ($diagnosticos->isEmpty()) {
            return response()->json(['message' => 'No se encontraron diagnósticos'], 404);
        } else {
            return response()->json($diagnosticos, 200);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_cita' => 'required|exists:cita,id',
            'id_tipo_diagnostico' => 'required|exists:tipo_diagnostico,id',
            'motivo' => 'required',
            'observaciones' => 'required',
            'tratamiento_sugerido' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['errores' => $validator->errors()], 400);
        }

        // 1. Crea el diagnóstico
        $diagnostico = Diagnostico::create($request->all());

        // 2. Cambia el estado de la cita asociada a "Atendida"
        $cita = Cita::find($request->id_cita);
        if ($cita) {
            $cita->estado_cita = 'Atendida';
            $cita->save();
        }

        return response()->json($diagnostico, 201);
    }

    public function show($id)
    {
        $diagnostico = Diagnostico::find($id);
        if ($diagnostico) {
            return response()->json($diagnostico, 200);
        } else {
            return response()->json(['message' => 'Diagnóstico no encontrado'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $diagnostico = Diagnostico::find($id);
        if ($diagnostico) {
            $diagnostico->update($request->all());
            return response()->json($diagnostico, 200);
        } else {
            return response()->json(['message' => 'Diagnóstico no encontrado'], 404);
        }
    }

    public function diagCita($id_cita)
    {
        $diagnostico = Diagnostico::with('tipo_diagnostico:id,nombre_diagnostico')
            ->where('id_cita', $id_cita)
            ->get();
        if ($diagnostico->isEmpty()) {
            return response()->json(['message' => 'No se encontraron diagnósticos'], 404);
        } else {
            return response()->json($diagnostico, 200);
        }
    }
    public function porPaciente($id_paciente)
    {
        try {
            $diagnosticos = DB::table('diagnostico as d')
                ->join('tipo_diagnostico as td', 'd.id_tipo_diagnostico', '=', 'td.id')
                ->join('cita as c', 'c.id', '=', 'd.id_cita')
                ->join('paciente as p', 'p.id', '=', 'c.id_paciente')
                ->where('p.id', $id_paciente)
                ->select('d.*', 'td.nombre_diagnostico')
                ->get();

            if ($diagnosticos->isEmpty()) {
                return response()->json([
                    'mensaje' => 'Diagnósticos no encontrado para este paciente'
                ], 404);
            }

            return response()->json($diagnosticos, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
