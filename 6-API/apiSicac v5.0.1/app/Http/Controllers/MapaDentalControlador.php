<?php

namespace App\Http\Controllers;

use App\Models\MapaDental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; //Validaciones

class MapaDentalControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $mapaDental = MapaDental::all();
        if($mapaDental->isEmpty()){
            $data = [
                'message' => 'No existen mapas dentales registrados',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($mapaDental, 200); //Solicitud exitosa
    }

    //Busca los mapas dentales de un historial medico puntual
    public function porHistorial($idHistorial){
        $mapaDental = MapaDental::where('id_historial_medico', $idHistorial)->get();
        $data = [
            'mapas_dentales' => $mapaDental,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite enviar datos o crear registros --> post
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
            'id_historial_medico' => 'required|integer|exists:historial_medico,id',
            'nombre_estandar' => 'required|string|max:40',
            'observacion_inicial' => 'nullable|string',
            'estado_mapa_dental' => 'required|string|max:20'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $mapaDental = MapaDental::create([
            'id_historial_medico' => $request->id_historial_medico,
            'nombre_estandar' => $request->nombre_estandar,
            'observacion_inicial' => $request->observacion_inicial,
            'estado_mapa_dental' => $request->estado_mapa_dental
        ]);

        if(!$mapaDental){
            $data = ['message' => 'Error al crear el Mapa dental', 'status' => 500];
            return response()->json($data, 500);
        }
        $data = [
            'message' => 'Mapa dental creado correctamente',
            'mapa_dental' => $mapaDental,
            'status' => 201 //Recurso creado correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $mapaDental = MapaDental::find($id);
        if(!$mapaDental){
            $data = ['message' => 'Mapa dental no encontrado', 'status' => 404];
            return response()->json($data, 404);
        }
        $data = ['mapa_dental' => $mapaDental, 'status' => 200];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $mapaDental = MapaDental::find($id);
        if(!$mapaDental){
            $data = ['message' => 'Mapa dental no encontrado', 'status' => 404];
            return response()->json($data, 404);
        }

        $validacion = Validator::make($request->all(),[
            'id_historial_medico' => 'required|integer|exists:historial_medico,id',
            'nombre_estandar' => 'required|string|max:40',
            'observacion_inicial' => 'nullable|string',
            'estado_mapa_dental' => 'required|string|max:20'
        ]);

        if($validacion->fails()){
            $data = ['message' => 'Error en la validacion de los datos', 'errors' => $validacion->errors(), 'status' => 400];
            return response()->json($data, 400);
        }

        $mapaDental->id_historial_medico = $request->id_historial_medico;
        $mapaDental->nombre_estandar = $request->nombre_estandar;
        $mapaDental->observacion_inicial = $request->observacion_inicial;
        $mapaDental->estado_mapa_dental = $request->estado_mapa_dental;
        $mapaDental->save(); //Acá propiamente se actualiza el registro

        $data = ['message' => 'Mapa dental actualizado', 'mapa_dental' => $mapaDental, 'status' => 200];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $mapaDental = MapaDental::find($id);
        if(!$mapaDental){
            $data = ['message' => 'Mapa dental no encontrado', 'status' => 404];
            return response()->json($data, 404);
        }

        $mapaDental->delete();
        $data = ['message' => 'Mapa dental eliminado', 'status' => 200];
        return response()->json($data, 200);
    }
}