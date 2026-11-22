<?php

namespace App\Http\Controllers;

use App\Models\TipoDocumento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; //Validaciones

class TipoDocumentoControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $tipoDoc = TipoDocumento::all(); //Trae todos los datos
        if($tipoDoc->isEmpty()){
            $data=[
                'message' => 'No existen tipos de documento registrados',
                'status' => 404 // Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($tipoDoc, 200); //Solicitud exitosa
    }

    //Permite enviar datos o crear registros --> post
    public function store (Request $request){
        $validacion = Validator::make($request->all(),[
            //'id' => 'required', -> En teoría ya no va, porque en MySQL es una PK autoincrement
            'sigla' => 'required',
            'nombre_documento' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $tipoDoc = TipoDocumento::create([
            //'id' => $request->id, -> Lo mismo, ya no va, porque en MySQL es una PK autoincrement
            'sigla' => $request->sigla,
            'nombre_documento' => $request->nombre_documento
        ]);

        if(!$tipoDoc){
            $data = [
                'message' => 'Error al crear el Tipo de Documento',
                'status' => 500 //Error interno del servidor, ejemplo error de sintaxis
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Tipo de Documento Creado Correctamente',
            'tipo_documento' => $tipoDoc,
            'status' => 201 //Recurso Creado Correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $tipoDoc = TipoDocumento::find($id);
        if(!$tipoDoc){
            $data =[
                'message' => 'Tipo de Documento no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];

            return response()->json($data, 404);
        }

        $data =[
            'tipo_documento'=>$tipoDoc,
            'status'=> 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $tipoDoc = TipoDocumento::find($id);
        if(!$tipoDoc){
            $data = [
                'message' => 'Tipo de Documento no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $tipoDoc->delete();
        $data = [
            'message' => "Tipo de Documento eliminado",
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $tipoDoc = TipoDocumento::find($id);
        if(!$tipoDoc){
            $data = [
                'message' => 'Tipo de Documento no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        $validacion = Validator::make($request->all(),[
            //'id' => 'required', -> Al ser PK, no se actualiza
            'sigla' => 'required',
            'nombre_documento' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        //$tipoDoc->id = $request->id; -> Lo mismo, al ser PK, no se actualiza
        $tipoDoc->sigla = $request->sigla;
        $tipoDoc->nombre_documento = $request->nombre_documento;
        
        $tipoDoc->save(); //Acá propiamente se actualiza el registro
        $data = [
            'message' => 'Tipo de Documento Actualizado',
            'tipo_documento' => $tipoDoc,
            'status' => 200 //Solicitud Exitosa
        ];
        return response()->json($data, 200);
    }
}
