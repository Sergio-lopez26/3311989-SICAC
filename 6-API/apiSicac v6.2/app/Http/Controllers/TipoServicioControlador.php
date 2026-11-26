<?php

namespace App\Http\Controllers;

use App\Models\TipoServicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; //Validaciones

class TipoServicioControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $tiposServicio = TipoServicio::all();
        if($tiposServicio->isEmpty()){
            $data=[
                'message' => 'No existen tipos de servicio registrados',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($tiposServicio, 200); //Solicitud exitosa
    }

    //Permite enviar datos o crear registros --> post
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
            'tipo_servicio' => 'required|string|max:40|unique:tipo_servicio,tipo_servicio',
            'descripcion' => 'required|string',
            'precio_actual' => 'required|numeric|min:0'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $tipoServicio = TipoServicio::create([
            'tipo_servicio' => $request->tipo_servicio,
            'descripcion' => $request->descripcion,
            'precio_actual' => $request->precio_actual
        ]);

        if(!$tipoServicio){
            $data = [
                'message' => 'Error al crear el Tipo de Servicio',
                'status' => 500 //Error interno del servidor
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Tipo de Servicio creado correctamente',
            'tipo_servicio' => $tipoServicio,
            'status' => 201 //Recurso creado correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $tipoServicio = TipoServicio::find($id);
        if(!$tipoServicio){
            $data =[
                'message' => 'Tipo de Servicio no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $data =[
            'tipo_servicio' => $tipoServicio,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $tipoServicio = TipoServicio::find($id);
        if(!$tipoServicio){
            $data = [
                'message' => 'Tipo de Servicio no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $validacion = Validator::make($request->all(),[
            'tipo_servicio' => 'required|string|max:40|unique:tipo_servicio,tipo_servicio,' . $id,
            'descripcion' => 'required|string',
            'precio_actual' => 'required|numeric|min:0'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $tipoServicio->tipo_servicio = $request->tipo_servicio;
        $tipoServicio->descripcion = $request->descripcion;
        $tipoServicio->precio_actual = $request->precio_actual;
        $tipoServicio->save(); //Acá propiamente se actualiza el registro

        $data = [
            'message' => 'Tipo de Servicio actualizado',
            'tipo_servicio' => $tipoServicio,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $tipoServicio = TipoServicio::find($id);
        if(!$tipoServicio){
            $data = [
                'message' => 'Tipo de Servicio no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $tipoServicio->delete();
        $data = [
            'message' => 'Tipo de Servicio eliminado',
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }
}