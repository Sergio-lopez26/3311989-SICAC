<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; //Encriptación
use Illuminate\Support\Facades\Validator; //Validaciones

class UsuarioControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $usuario = Usuario::all(); //Trae todos los datos
        if($usuario->isEmpty()){
            $data=[
                'message' => 'No existen usuarios registrados',
                'status' => 404 // Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($usuario, 200); //Solicitud exitosa
    }

    //Permite enviar datos o crear registros --> post
    public function store (Request $request){
        $validacion = Validator::make($request->all(),[
            'email' => 'required',
            'password' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $usuario = Usuario::create([
            'email' => $request->email,
            'password' => Hash::make($request->password), //->para encriptar
        ]);

        if(!$usuario){
            $data = [
                'message' => 'Error al crear el Usuario',
                'status' => 500 //Error interno del servidor, ejemplo, un error de sintaxis
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Usuario Creado Correctamente',
            'usuario' => $usuario,
            'status' => 201 //Recurso Creado Correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $usuario = Usuario::find($id);
        if(!$usuario){
            $data =[
                'message' => 'Usuario no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];

            return response()->json($data, 404);
        }

        $data =[
            'usuario'=>$usuario,
            'status'=> 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $usuario = Usuario::find($id);
        if(!$usuario){
            $data = [
                'message' => 'Usuario no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $usuario->delete();
        $data = [
            'message' => "Usuario eliminado",
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $usuario = Usuario::find($id);
        if(!$usuario){
            $data = [
                'message' => 'Usuario no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        $validacion = Validator::make($request->all(),[
            'email' => 'required',
            'password' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $usuario->email = $request->email;
        $usuario->password = Hash::make($request->password);

        //Falta lo de que acepte ******** y encripte al editar pass, como en el backend
        $usuario->save(); //Acá propiamente se actualiza el registro
        $data = [
            'message' => 'Usuario Actualizado',
            'usuario' => $usuario,
            'status' => 200 //Solicitud Exitosa
        ];
        return response()->json($data, 200);
    }
}
