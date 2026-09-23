<?php

namespace App\Http\Controllers;

use App\Models\Cita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; //Validaciones

class CitaControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $cita = Cita::with(['paciente', 'medico', 'tipo_cita', 'pago'])->get();
        if($cita->isEmpty()){
            $data = [
                'message' => 'No existen citas registradas',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($cita, 200); //Solicitud exitosa
    }

    //Busca los agendamientos asociados a un paciente puntual
    public function porPaciente($idPaciente){
        $agendamiento = Cita::with(['medico', 'tipo_cita', 'pago'])
            ->where('id_paciente', $idPaciente)
            ->orderBy('fecha_cita', 'desc')
            ->get();
        $data = [
            'agendamientos' => $agendamiento,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Busca los agendamientos asociados a un medico puntual
    public function porMedico($idMedico){
        $agendamiento = Agendamiento::with(['paciente', 'servicio', 'pago'])
            ->where('id_medico', $idMedico)
            ->orderBy('fecha_hora', 'desc')
            ->get();
        $data = [
            'agendamientos' => $agendamiento,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Busca los agendamientos filtrados por estado (pendiente, confirmado, cancelado, completado)
    public function porEstado($estado){
        $agendamiento = Agendamiento::with(['paciente', 'medico', 'servicio'])
            ->where('estado_agendamiento', $estado)
            ->orderBy('fecha_hora', 'asc')
            ->get();
        $data = [
            'agendamientos' => $agendamiento,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite enviar datos o crear registros --> post
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
            'id_paciente' => 'required|integer|exists:paciente,id',
            'id_medico' => 'required|integer|exists:medico,id',
            'id_tipo_cita' => 'required',
            'fecha_cita' => 'required|date',
            'hora_inicio'=>'required|date_format:H:i',
            'hora_fin'=>'required|date_format:H:i',
            'estado_cita' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        //Verifica que el medico no tenga ya una cita activa en la misma fecha y hora
        $cruce = Cita::where('id_medico', $request->id_medico)
            ->where('fecha_cita', $request->fecha_cita)
            ->whereNotIn('estado_cita', ['cancelado'])
            ->exists();

        if($cruce){
            $data = [
                'message' => 'El medico ya tiene un agendamiento en esa fecha y hora',
                'status' => 409 //Conflicto con el estado actual del recurso
            ];
            return response()->json($data, 409);
        }

        $agendamiento = Cita::create([
            'id_paciente' => $request->id_paciente,
            'id_medico' => $request->id_medico,
            'id_tipo_cita' => $request->id_tipo_cita,
            'fecha_cita' => $request->fecha_cita,
            'hora_inicio' => $request->hora_inicio,
            'hora_fin'=> $request->hora_fin,
            'estado_cita' => $request->estado_cita
        ]);

        if(!$agendamiento){
            $data = [
                'message' => 'Error al crear el Agendamiento',
                'status' => 500 //Error interno del servidor
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Agendamiento creado correctamente',
            'agendamiento' => $agendamiento,
            'status' => 201 //Recurso creado correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $agendamiento = Cita::with(['paciente', 'medico', 'tipo_cita', 'pago'])->find($id);
        if(!$agendamiento){
            $data = [
                'message' => 'Cita no encontrada',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $data = [
            'agendamiento' => $agendamiento,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $agendamiento = Cita::find($id);
        if(!$agendamiento){
            $data = [
                'message' => 'Cita no encontrada',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $validacion = Validator::make($request->all(),[
           'id_paciente' => 'required|integer|exists:paciente,id',
            'id_medico' => 'required|integer|exists:medico,id',
            'id_tipo_cita' => 'required',
            'fecha_cita' => 'required|date',
            'hora_inicio'=>'required|date_format:H:i',
            'hora_fin'=>'required|date_format:H:i',
            'estado_cita' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        //Verifica cruce de horario con otro agendamiento del mismo medico (excluyendo el actual)
        $cruce = Cita::where('id_medico', $request->id_medico)
            ->where('fecha_cita', $request->fecha_cita)
            ->whereNotIn('estado_cita', ['cancelado'])
            ->where('id', '<>', $id)
            ->exists();

        if($cruce){
            $data = [
                'message' => 'El medico ya tiene un agendamiento en esa fecha y hora',
                'status' => 409 //Conflicto con el estado actual del recurso
            ];
            return response()->json($data, 409);
        }

        $agendamiento->id_paciente = $request->id_paciente;
        $agendamiento->id_medico = $request->id_medico;
        $agendamiento->id_tipo_cita = $request->id_tipo_cita;
        $agendamiento->fecha_cita = $request->fecha_cita;
        $agendamiento->hora_inicio = $request->hora_inicio;
        $agendamiento->estado_cita = $request->estado_cita;
        $agendamiento->hora_fin = $request->hora_fin;
        $agendamiento->save(); //Acá propiamente se actualiza el registro

        $data = [
            'message' => 'Cita actualizada',
            'cita' => $agendamiento,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $agendamiento = Cita::find($id);
        if(!$agendamiento){
            $data = [
                'message' => 'Cita no encontrada',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $agendamiento->delete();
        $data = [
            'message' => 'Cita eliminada',
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }
}
