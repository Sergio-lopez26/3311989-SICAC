<?php

namespace App\Http\Controllers;

use App\Models\PiezaDental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; //Validaciones

class PiezaDentalControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $piezaDental = PiezaDental::all();
        if($piezaDental->isEmpty()){
            $data = ['message' => 'No existen piezas dentales registradas', 'status' => 404];
            return response()->json($data, 404);
        }
        return response()->json($piezaDental, 200); //Solicitud exitosa
    }

    //Busca las piezas dentales de un mapa puntual
    public function porMapa($idMapa){
        $piezaDental = PiezaDental::where('id_mapa', $idMapa)->get();
        $data = ['piezas_dentales' => $piezaDental, 'status' => 200];
        return response()->json($data, 200);
    }

    //Permite enviar datos o crear registros --> post
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
            'id_mapa' => 'required|integer|exists:mapa_dental,id',
            'nomenclatura_fdi' => 'required|string|max:10',
            'cuadrante' => 'required|integer',
            'posicion' => 'required|integer',
            'estado_inicial' => 'nullable|string|max:40',
            'estado_actual' => 'nullable|string|max:30'
        ]);

        if($validacion->fails()){
            $data = ['message' => 'Error en la validacion de los datos', 'errors' => $validacion->errors(), 'status' => 400];
            return response()->json($data, 400);
        }

        $piezaDental = PiezaDental::create([
            'id_mapa' => $request->id_mapa,
            'nomenclatura_fdi' => $request->nomenclatura_fdi,
            'cuadrante' => $request->cuadrante,
            'posicion' => $request->posicion,
            'estado_inicial' => $request->estado_inicial,
            'estado_actual' => $request->estado_actual
        ]);

        if(!$piezaDental){
            $data = ['message' => 'Error al crear la Pieza dental', 'status' => 500];
            return response()->json($data, 500);
        }
        $data = ['message' => 'Pieza dental creada correctamente', 'pieza_dental' => $piezaDental, 'status' => 201];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $piezaDental = PiezaDental::find($id);
        if(!$piezaDental){
            $data = ['message' => 'Pieza dental no encontrada', 'status' => 404];
            return response()->json($data, 404);
        }

        $data = ['pieza_dental' => $piezaDental, 'status' => 200];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $piezaDental = PiezaDental::find($id);
        if(!$piezaDental){
            $data = ['message' => 'Pieza dental no encontrada', 'status' => 404];
            return response()->json($data, 404);
        }

        $validacion = Validator::make($request->all(),[
            'id_mapa' => 'required|integer|exists:mapa_dental,id',
            'nomenclatura_fdi' => 'required|string|max:10',
            'cuadrante' => 'required|integer',
            'posicion' => 'required|integer',
            'estado_inicial' => 'nullable|string|max:40',
            'estado_actual' => 'nullable|string|max:30'
        ]);

        if($validacion->fails()){
            $data = ['message' => 'Error en la validacion de los datos', 'errors' => $validacion->errors(), 'status' => 400];
            return response()->json($data, 400);
        }

        $piezaDental->id_mapa = $request->id_mapa;
        $piezaDental->nomenclatura_fdi = $request->nomenclatura_fdi;
        $piezaDental->cuadrante = $request->cuadrante;
        $piezaDental->posicion = $request->posicion;
        $piezaDental->estado_inicial = $request->estado_inicial;
        $piezaDental->estado_actual = $request->estado_actual;
        $piezaDental->save(); //Acá propiamente se actualiza el registro

        $data = ['message' => 'Pieza dental actualizada', 'pieza_dental' => $piezaDental, 'status' => 200];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $piezaDental = PiezaDental::find($id);
        if(!$piezaDental){
            $data = ['message' => 'Pieza dental no encontrada', 'status' => 404];
            return response()->json($data, 404);
        }

        $piezaDental->delete();
        $data = ['message' => 'Pieza dental eliminada', 'status' => 200];
        return response()->json($data, 200);
    }
}