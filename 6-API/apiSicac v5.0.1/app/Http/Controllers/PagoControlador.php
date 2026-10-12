<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; //Validaciones

class PagoControlador extends Controller
{
    //Obtiene todos los datos de la tabla --> get
    public function index(){
        $pago = Pago::with('agendamiento')->get();
        if($pago->isEmpty()){
            $data = [
                'message' => 'No existen pagos registrados',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }
        return response()->json($pago, 200); //Solicitud exitosa
    }

    //Busca el pago asociado a un agendamiento puntual (relacion 1 a 1)
    public function porAgendamiento($idAgendamiento){
        $pago = Pago::with('agendamiento')->where('id_agendamiento', $idAgendamiento)->first();
        if(!$pago){
            $data = [
                'message' => 'Este agendamiento no tiene un pago registrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $data = [
            'pago' => $pago,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite enviar datos o crear registros --> post
    public function store(Request $request){
        $validacion = Validator::make($request->all(),[
            'id_agendamiento' => 'required|integer|exists:agendamiento,id|unique:pago,id_agendamiento',
            'monto' => 'required|numeric|min:0',
            'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia,otro',
            'estado_pago' => 'nullable|in:pendiente,pagado,anulado',
            'fecha_pago' => 'nullable|date'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $pago = Pago::create([
            'id_agendamiento' => $request->id_agendamiento,
            'monto' => $request->monto,
            'metodo_pago' => $request->metodo_pago,
            'estado_pago' => $request->estado_pago ?? 'pendiente',
            'fecha_pago' => $request->fecha_pago
        ]);

        if(!$pago){
            $data = [
                'message' => 'Error al crear el Pago',
                'status' => 500 //Error interno del servidor
            ];
            return response()->json($data, 500);
        }

        $data = [
            'message' => 'Pago creado correctamente',
            'pago' => $pago,
            'status' => 201 //Recurso creado correctamente
        ];
        return response()->json($data, 201);
    }

    //Busca un registro
    public function show($id){
        $pago = Pago::with('agendamiento')->find($id);
        if(!$pago){
            $data = [
                'message' => 'Pago no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $data = [
            'pago' => $pago,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite actualizar registros --> put
    public function update(Request $request, $id){
        $pago = Pago::find($id);
        if(!$pago){
            $data = [
                'message' => 'Pago no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $validacion = Validator::make($request->all(),[
            'monto' => 'required|numeric|min:0',
            'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia,otro',
            'estado_pago' => 'required|in:pendiente,pagado,anulado',
            'fecha_pago' => 'nullable|date'
        ]);

        if($validacion->fails()){
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validacion->errors(),
                'status' => 400 //Datos enviados no cumplen con la validacion
            ];
            return response()->json($data, 400);
        }

        $pago->monto = $request->monto;
        $pago->metodo_pago = $request->metodo_pago;
        $pago->estado_pago = $request->estado_pago;
        $pago->fecha_pago = $request->fecha_pago;
        $pago->save(); //Acá propiamente se actualiza el registro

        $data = [
            'message' => 'Pago actualizado',
            'pago' => $pago,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Marca un pago como pagado, registrando la fecha de pago automaticamente
    public function marcarPagado($id){
        $pago = Pago::find($id);
        if(!$pago){
            $data = [
                'message' => 'Pago no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $pago->estado_pago = 'pagado';
        $pago->fecha_pago = now();
        $pago->save();

        $data = [
            'message' => 'Pago marcado como pagado',
            'pago' => $pago,
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }

    //Permite eliminar registros --> delete
    public function destroy($id){
        $pago = Pago::find($id);
        if(!$pago){
            $data = [
                'message' => 'Pago no encontrado',
                'status' => 404 //Verifica si la ruta existe
            ];
            return response()->json($data, 404);
        }

        $pago->delete();
        $data = [
            'message' => 'Pago eliminado',
            'status' => 200 //Solicitud exitosa
        ];
        return response()->json($data, 200);
    }
}
