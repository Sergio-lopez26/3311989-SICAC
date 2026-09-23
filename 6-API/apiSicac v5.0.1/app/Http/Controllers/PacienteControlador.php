<?php

namespace App\Http\Controllers;

use App\Models\Paciente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; //Encriptación
use Illuminate\Support\Facades\Validator; //Validaciones

class PacienteControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $paciente = Paciente::all(); //Trae todos los datos
        if($paciente->isEmpty()){
            $data=[
                'message' => 'No existen pacientes registrados',
                'status' => 404 // Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($paciente, 200); //Solicitud exitosa
    }

    //Permite enviar datos o crear registros --> post
    public function store (Request $request){
        $validacion = Validator::make($request->all(),[
            'id_usuario' => 'required',
            'id_tipo_documento' => 'required',
            'numero_documento' => 'required',
            'email' => 'required',
            'password' => 'required',
            'fecha_nacimiento' => 'required',
            'primer_nombre' => 'required',
            'segundo_nombre' => 'nullable', //Es como el null
            'primer_apellido' => 'required',
            'segundo_apellido' => 'nullable',
            'numero_celular' => 'required',
            'tipo_sangre' => 'required',
            'genero' => 'required',
            'nombre_acudiente' => 'nullable',
            'documento_acudiente' => 'nullable',
            'estado_paciente' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $paciente = Paciente::create([
            'id_usuario' => $request->id_usuario,
            'id_tipo_documento' => $request->id_tipo_documento,
            'numero_documento' => $request->numero_documento,
            'email' => $request->email,
            'password' => Hash::make($request->password), //->para encriptar
            'fecha_nacimiento' => $request->fecha_nacimiento,
            'primer_nombre' => $request->primer_nombre,
            'segundo_nombre' => $request->segundo_nombre,
            'primer_apellido' => $request->primer_apellido,
            'segundo_apellido' => $request->segundo_apellido,
            'numero_celular' => $request->numero_celular,
            'tipo_sangre' => $request->tipo_sangre,
            'genero' => $request->genero,
            'nombre_acudiente' => $request->nombre_acudiente,
            'documento_acudiente' => $request->documento_acudiente,
            'estado_paciente' => $request->estado_paciente
            
        ]);

        if(!$paciente){
            $data = [
                'message' => 'Error al crear el Paciente',
                'status' => 500 //Error interno del servidor, ejemplo, un error de sintaxis
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Paciente Creado Correctamente',
            'paciente' => $paciente,
            'status' => 201 //Recurso Creado Correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $paciente = Paciente::find($id);
        if(!$paciente){
            $data =[
                'message' => 'Paciente no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];

            return response()->json($data, 404);
        }

        $data =[
            'paciente'=>$paciente,
            'status'=> 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $paciente = Paciente::find($id);
        if(!$paciente){
            $data = [
                'message' => 'Paciente no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $paciente->delete();
        $data = [
            'message' => "Paciente eliminado",
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $paciente = Paciente::find($id);
        if(!$paciente){
            $data = [
                'message' => 'Paciente no encontrado',
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
            'fecha_nacimiento' => 'required',
            'primer_nombre' => 'required',
            'segundo_nombre' => 'nullable', //Es como el null
            'primer_apellido' => 'required',
            'segundo_apellido' => 'nullable',
            'numero_celular' => 'required',
            'tipo_sangre' => 'required',
            'genero' => 'required',
            'nombre_acudiente' => 'nullable',
            'documento_acudiente' => 'nullable',
            'estado_paciente' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $paciente->id_usuario = $request->id_usuario;
        $paciente->id_tipo_documento = $request->id_tipo_documento;
        $paciente->numero_documento = $request->numero_documento; 
        $paciente->email = $request->email;
        $paciente->password = Hash::make($request->password);
        $paciente->fecha_nacimiento = $request->fecha_nacimiento;
        $paciente->primer_nombre = $request->primer_nombre;
        $paciente->segundo_nombre = $request->segundo_nombre;
        $paciente->primer_apellido = $request->primer_apellido;
        $paciente->segundo_apellido = $request->segundo_apellido;
        $paciente->numero_celular = $request->numero_celular;
        $paciente->tipo_sangre = $request->tipo_sangre;
        $paciente->genero = $request->genero;
        $paciente->nombre_acudiente = $request->nombre_acudiente;
        $paciente->documento_acudiente = $request->documento_acudiente;
        $paciente->estado_paciente = $request->estado_paciente;

        //Falta lo de que acepte ******** y encripte al editar pass, como en el backend
        $paciente->save(); //Acá propiamente se actualiza el registro
        $data = [
            'message' => 'Paciente Actualizado',
            'paciente' => $paciente,
            'status' => 200 //Solicitud Exitosa
        ];
        return response()->json($data, 200);
    }
}
