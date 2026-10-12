<?php

namespace App\Http\Controllers;

use App\Models\RolUsuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; //Validaciones

class RolUsuarioControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $rolUsuario = RolUsuario::all(); //Trae todos los datos
        if($rolUsuario->isEmpty()){
            $data=[
                'message' => 'No existen asignaciones de rol a usuarios registrados',
                'status' => 404 // Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($rolUsuario, 200); //Solicitud exitosa
    }

    //Permite enviar datos o crear registros --> post
    public function store (Request $request){
        $validacion = Validator::make($request->all(),[
            'id_rol' => 'required',
            'id_usuario' => 'required'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $rolUsuario = RolUsuario::create([
            'id_rol' => $request->id_rol,
            'id_usuario' => $request->id_usuario
        ]);

        if(!$rolUsuario){
            $data = [
                'message' => 'Error al asignar Rol al Usuario',
                'status' => 500 //Error interno del servidor, ejemplo, un error de sintaxis
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Rol asignado al Usuario Correctamente',
            'rolUsuario' => $rolUsuario,
            'status' => 201 //Recurso Creado Correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca todas las asignaciones de un mismo rol
    public function show($id_rol){
        $rolUsuario = RolUsuario::where('id_rol', $id_rol)->get(); //Para obtener un listado con los usuario que comparten el mismo rol
        if(!$rolUsuario){
            $data =[
                'message' => 'No se encontraron Asignaciones de ese Rol',
                'status' => 404 //Verifica si la ruta existe
            ];

            return response()->json($data, 404);
        }

        $data =[
            'rolUsuario'=>$rolUsuario,
            'status'=> 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    //En este caso se requiere de ambos parámetros para poder eliminar el registro
    public function destroy($id_rol, $id_usuario){
        $rolUsuario = RolUsuario::where('id_rol', $id_rol)->where('id_usuario', $id_usuario)->delete(); //Con el delete(), ya ejecuta la sentencia de borrado si encuentra el rol y el usuario
        if(!$rolUsuario){
            $data = [
                'message' => 'Asignación de Rol no encontrada',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $data = [
            'message' => "Asignación de Rol eliminada",
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    /*
    Al ser rol_usuario una tabla intermedia, su estructura cambia un poco:
    - Ya no se puede actualizar, sino mas bien, se elimina una asignacion y se crea una nueva, pero no se edita
    - Adicionalmente, para eliminar, se necesita si o si los datos de ambos campos (id_rol y id_usuario) -> Esto para
        evitar eliminar todos los usuarios que tienen asignado ese mismo rol
    */
}
