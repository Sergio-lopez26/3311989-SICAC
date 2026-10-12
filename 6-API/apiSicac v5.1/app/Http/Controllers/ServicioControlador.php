<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use App\Models\TipoServicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; //Validaciones

class ServicioControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $servicio = Servicio::all();
        if($servicio->isEmpty()){
            $data = [
                'message' => 'No existen servicios registrados',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($servicio, 200); //Solicitud exitosa
    }

    //Busca los servicios asociados a un diagnostico puntual
    public function porDiagnostico($idDiagnostico){
        $servicio = Servicio::where('id_diagnostico', $idDiagnostico)->get();
        $data = [
            'servicios' => $servicio,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite enviar datos o crear registros --> post
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
            'id_tipo_servicio' => 'required|integer|exists:tipo_servicio,id',
            'id_diagnostico' => 'required|integer|exists:diagnostico,id',
            'nombre_servicio' => 'required|string|max:40',
            'procedimiento' => 'required|string'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $precio = TipoServicio::find($request->id_tipo_servicio)->precio_actual;
        $servicio = Servicio::create([
            'id_tipo_servicio' => $request->id_tipo_servicio,
            'id_diagnostico' => $request->id_diagnostico,
            'nombre_servicio' => $request->nombre_servicio,
            'procedimiento' => $request->procedimiento,
            'precio_aplicado' => $precio
        ]);

        if(!$servicio){
            $data = [
                'message' => 'Error al crear el Servicio',
                'status' => 500 //Error interno del servidor
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Servicio creado correctamente',
            'servicio' => $servicio,
            'status' => 201 //Recurso creado correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $servicio = Servicio::find($id);
        if(!$servicio){
            $data = [
                'message' => 'Servicio no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $data = [
            'servicio' => $servicio,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $servicio = Servicio::find($id);
        if(!$servicio){
            $data = [
                'message' => 'Servicio no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $validacion = Validator::make($request->all(),[
            'id_tipo_servicio' => 'required|integer|exists:tipo_servicio,id',
            'id_diagnostico' => 'required|integer|exists:diagnostico,id',
            'nombre_servicio' => 'required|string|max:40',
            'procedimiento' => 'required|string',
            'precio_aplicado' => 'required|numeric|min:0'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $servicio->id_tipo_servicio = $request->id_tipo_servicio;
        $servicio->id_diagnostico = $request->id_diagnostico;
        $servicio->nombre_servicio = $request->nombre_servicio;
        $servicio->procedimiento = $request->procedimiento;
        $servicio->precio_aplicado = $request->precio_aplicado;
        $servicio->save(); //Acá propiamente se actualiza el registro

        $data = [
            'message' => 'Servicio actualizado',
            'servicio' => $servicio,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $servicio = Servicio::find($id);
        if(!$servicio){
            $data = [
                'message' => 'Servicio no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $servicio->delete();
        $data = [
            'message' => 'Servicio eliminado',
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }
}