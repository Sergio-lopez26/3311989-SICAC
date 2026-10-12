<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; //Validaciones

class RolControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $rol = Rol::all(); //Trae todos los datos
        if($rol->isEmpty()){
            $data=[
                'message' => 'No hay roles registrados',
                'status' => 404 // Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($rol, 200); //Solicitud exitosa
    }

    //Permite enviar datos o crear registros --> post
    public function store (Request $request){
        $validacion = Validator::make($request->all(),[
            //'id' => 'required', -> En teoría ya no va, porque en MySQL es una PK autoincrement
            'rol' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $rol = Rol::create([
            //'id' => $request->id, -> Lo mismo, ya no va, porque en MySQL es una PK autoincrement
            'rol' => $request->rol
        ]);

        if(!$rol){
            $data = [
                'message' => 'Error al crear el Rol',
                'status' => 500 //Error interno del servidor, ejemplo error de sintaxis
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Rol Creado Correctamente',
            'rol' => $rol,
            'status' => 201 //Recurso Creado Correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $rol = Rol::find($id);
        if(!$rol){
            $data =[
                'message' => 'Rol no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];

            return response()->json($data, 404);
        }

        $data =[
            'rol'=>$rol,
            'status'=> 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $rol = Rol::find($id);
        if(!$rol){
            $data = [
                'message' => 'Rol no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $rol->delete();
        $data = [
            'message' => "Rol eliminado",
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $rol = Rol::find($id);
        if(!$rol){
            $data = [
                'message' => 'Rol no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        $validacion = Validator::make($request->all(),[
            //'id' => 'required', -> Al ser PK, no se actualiza
            'rol' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        //$rol->id = $request->id; -> Lo mismo, al ser PK, no se actualiza
        $rol->rol = $request->rol;
        
        $rol->save(); //Acá propiamente se actualiza el registro
        $data = [
            'message' => 'Rol Actualizado',
            'rol' => $rol,
            'status' => 200 //Solicitud Exitosa
        ];
        return response()->json($data, 200);
    }
}
