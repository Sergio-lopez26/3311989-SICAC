<?php

namespace App\Http\Controllers;

use App\Models\Medico;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; //Encriptación
use Illuminate\Support\Facades\Validator; //Validaciones

class MedicoControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $medico = Medico::all(); //Trae todos los datos
        if($medico->isEmpty()){
            $data=[
                'message' => 'No existen medicos registrado',
                'status' => 404 // Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($medico, 200); //Solicitud exitosa
    }

    //Permite enviar datos o crear registros --> post
    public function store (Request $request){
        $validacion = Validator::make($request->all(),[
            'id_usuario' => 'required',
            'id_tipo_documento' => 'required',
            'numero_documento' => 'required',
            'email' => 'required',
            'password' => 'required',
            'nombres' => 'required',
            'apellidos' => 'required',
            'matricula_profesional' => 'required',
            'numero_celular' => 'required',
            'estado_medico' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $medico = Medico::create([
            'id_usuario' => $request->id_usuario,
            'id_tipo_documento' => $request->id_tipo_documento,
            'numero_documento' => $request->numero_documento,
            'email' => $request->email,
            'password' => Hash::make($request->password), //->para encriptar
            'nombres' => $request->nombres,
            'apellidos' => $request->apellidos,
            'matricula_profesional' => $request->matricula_profesional,
            'numero_celular' => $request->numero_celular,
            //No se agrega fecha_registro, ya que es un campo con TIMESTAMP DEFAULT CURRENT_TIMESTAMP -> siendo este, automático en su creación
            //Así mismo este campo no se valida ni se actualiza
            'estado_medico' => $request->estado_medico
            
        ]);

        if(!$medico){
            $data = [
                'message' => 'Error al crear al Medico',
                'status' => 500 //Error interno del servidor, ejemplo, un error de sintaxis
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Medico Creado Correctamente',
            'medico' => $medico,
            'status' => 201 //Recurso Creado Correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $medico = Medico::find($id);
        if(!$medico){
            $data =[
                'message' => 'Medico no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];

            return response()->json($data, 404);
        }

        $data =[
            'medico'=>$medico,
            'status'=> 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $medico = Medico::find($id);
        if(!$medico){
            $data = [
                'message' => 'Medico no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $medico->delete();
        $data = [
            'message' => "Medico eliminado",
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $medico = Medico::find($id);
        if(!$medico){
            $data = [
                'message' => 'Medico no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        $validacion = Validator::make($request->all(),[
            'id_usuario' => 'required',
            'id_tipo_documento' => 'required',
            'numero_documento' => 'required',
            'email' => 'required',
            'password' => 'required',
            'nombres' => 'required',
            'apellidos' => 'required',
            'matricula_profesional' => 'required',
            'numero_celular' => 'required',
            'estado_medico' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $medico->id_usuario = $request->id_usuario;
        $medico->id_tipo_documento = $request->id_tipo_documento;
        $medico->numero_documento = $request->numero_documento;
        $medico->email = $request->email;
        $medico->password = Hash::make($request->password);
        $medico->nombres = $request->nombres;
        $medico->apellidos = $request->apellidos;
        $medico->matricula_profesional = $request->matricula_profesional;
        $medico->numero_celular = $request->numero_celular;
        $medico->estado_medico = $request->estado_medico;

        //Falta lo de que acepte ******** y encripte al editar pass, como en el backend
        $medico->save(); //Acá propiamente se actualiza el registro
        $data = [
            'message' => 'Medico Actualizado',
            'paciente' => $medico,
            'status' => 200 //Solicitud Exitosa
        ];
        return response()->json($data, 200);
    }
}
