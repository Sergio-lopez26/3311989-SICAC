<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;


class AuthController extends Controller
{
    public function login(Request $request){
        $validator = Validator::make($request->all(), [
            'email' => 'required|string', //Se valida que el "campo" sea obligatorio y tipo String
            'password' => 'required|string|min:8' //Acá se valida adicional a lo anterior, que el tamaño de lo ingresado sea no menor a 8
        ]);

        if($validator -> fails()){ //Si la validación falla
            return response()->json([
                'success'=>false,
                'message'=>'Error de validación',
                'errors'=>$validator->errors()
            ], 422);
        }
        
        $user = Usuario::where('email', $request->email)->first(); //Con esto se obtiene el primer registro de la consulta -> first()

        if (!$user){ //Si el resultado de la validación es vacío, osea con nada se encuentra
            return response()->json([
                'success'=> false,
                'message'=> 'Usuario no encontrado'
            ], 401);
        }

        //Ya que no admite los pass encriptados por bcrypt en node.js -> Pues hacemos que se reemplace el prefijo '$2b$' por el que pone hash '$2y$'
        //Entonces si el hash ya tiene $2y$ no pasa nada, lo toma, pero si tiene $2b$ solo lo cambia o mejor lo reemplaza a $2y$ pero solo en el instante no en la BBDD
        $passwordCompatibleConLaravel = str_replace('$2b$', '$2y$', $user->password);

        // Validamos usando el hash normalizado
        if (!Hash::check($request->password, $passwordCompatibleConLaravel)) {
            return response()->json([
                'success'=> false,
                'message'=> 'Contraseña incorrecta'
            ], 401);
        }

        /*if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success'=> false,
                'message'=> 'Contraseña incorrecta'
            ], 401);
        }*/

        $user->load('roles'); //Se carga la relacion de usuario-rol

        try {
            $token = JWTAuth::fromUser($user);
        }catch (JWTException $e) {
            return response()->json([
                'success'=> false,
                'message'=> 'Error al generar token: ' . $e->getMessage()
            ], 500);
        }

        $responseData = [
            'success' => true,
            'data' => [
                'user' => [
                    'id_usuario' => $user->id,
                    'email' => $user->email,
                    'roles' => $user->roles->map(function($rol){
                        return[
                            'id' => $rol->id,
                            'rol' => $rol->rol
                        ];
                    })
                ],
                'token' => $token,
                'token_type' => 'bearer', //Tipo de token -> Importante
                'expires_in' => auth()->factory()->getTTL() * 60 //Se establece el limite de expiración para el token
            ]
        ];

        //Guardar en cookie -> Es opcional, ya que también se puede hacer via localStorage
        $cookie = Cookie::make(
            'jwt_token',
            $token,
            auth()->factory()->getTTL(),
            '/',
            null,
            false,
            true,
            false,
            'lax'
        );

        return response()->json($responseData, 200)->withCookie($cookie);
    }

    public function logout(Request $request){
        try{
            $token = JWTAuth::getToken();

            if(!$token){
                return response()->json([
                    'success' => false,
                    'message' => 'Token no proporcionado'
                ], 400);
            }

            JWTAuth::invalidate($token);

            $cookie = Cookie::forget('jwt_token');

            return response()->json([
                'success' => true,
                'message' => 'Su sesión ha cerrado exitosamente'
            ], 200)->withCookie($cookie);
        }
        catch(JWTException $e){
            return response()->json([
                'success' => false,
                'message' => 'Error al cerrar sesión: ' . $e->getMessage()
            ], 500);
        }
    }

    public function me(Request $request){
        try{
            $user = auth()->user();

            if(!$user){
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $user->load('roles');

            return response()->json([
                'success' => true,
                'data' =>[
                    'user' =>[
                        'id_usuario' => $user->id,
                        'roles' => $user->roles->map(function($rol){
                            return[
                                'id' => $rol->id,
                                'rol' => $rol->rol
                            ];
                        })
                    ]
                ]
            ],200);
        }
        catch(\Exception $e){
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener usuario: ' . $e->getMessage()
            ], 401);
        }
    }

    public function refresh(Request $request){
        try{
            $token = JWTAuth::refresh(JWTAuth::getToken());

            $cookie = Cookie::make(
                'jwt_token',
                $token,
                auth()->factory()->getTTL(),
                '/',
                null,
                false,
                true,
                false,
                'lax'
            );

            return response()->json([
                'success' => true,
                'data' =>[
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => auth()->factory()->getTTL() * 60
                ]
            ], 200)->withCookie($cookie);
        }
        catch (JWTException $e){
            return response()->json([
                'success' => false,
                'message' => 'Error al refrescar token: ' . $e->getMessage()
            ], 500);
        }
    }
}
