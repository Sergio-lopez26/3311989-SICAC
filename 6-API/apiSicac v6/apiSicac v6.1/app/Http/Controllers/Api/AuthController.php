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
//use Illuminate\Support\Facades\DB; //Sirve para ejecutar consulta SQL directas desde la BD


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

        //Ya no -> $passwordCompatibleConLaravel = str_replace('$2b$', '$2y$', $user->password);
        //Ya que no admite los pass encriptados por bcrypt en node.js -> Pues hacemos que se reemplace el prefijo '$2b$' por el que pone hash '$2y$'
        //Entonces si el hash ya tiene $2y$ no pasa nada, lo toma, pero si tiene $2b$ solo lo cambia o mejor lo reemplaza a $2y$ pero solo en el instante no en la BBDD
        //Adicional se admite el texto plano como pass
        $hashGuardado = trim($user->password);
        $passwordCompatibleConLaravel = false;

        if (preg_match('/^\$2[aby]\$/', $hashGuardado)) { //preg_match es una funcion nativa de PHP
            $passwordCompatibleConLaravel = password_verify($request->password, $hashGuardado); //password_verify también es una funcion nativa de PHP que soporta nativamente $2y$, $2b$ y $2a$
        } else {
            $passwordCompatibleConLaravel = ($request->password === $hashGuardado);
        }

        if (!$passwordCompatibleConLaravel) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        /* Validamos usando el hash normalizado
        if (!Hash::check($request->password, $passwordCompatibleConLaravel)) {
            return response()->json([
                'success'=> false,
                'message'=> 'Contraseña incorrecta'
            ], 401);
        }*/

        /*if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success'=> false,
                'message'=> 'Contraseña incorrecta'
            ], 401);
        }*/

        $user->load('roles'); //Se carga la relaciones de usuario -> roles (N:N), paciente (1:1) y medico (1:1)

        $rolesAsignados = $user->roles->pluck('rol')->filter()->values()->toArray();
        $paciente       = $user->paciente;
        $medico         = $user->medico;

        // Registro incompleto (no tiene rol ni perfil en paciente o médico)
        if (empty($rolesAsignados) && !$paciente && !$medico) {
            return response()->json([
                'success'            => true,
                'registroIncompleto' => true,
                'message'            => 'Registro incompleto como médico o paciente',
                'usuario'            => [
                    'id'    => $user->id,
                    'email' => $user->email
                ]
            ], 200);
        }

        // Determinamos nombre completo desde las relaciones 1 a 1
        $nombreUsuario   = 'Usuario';
        $apellidoUsuario = '';

        if ($medico) {
            $nombreUsuario   = $medico->nombres;
            $apellidoUsuario = $medico->apellidos ?? '';
        } elseif ($paciente) {
            $nombreUsuario   = $paciente->primer_nombre;
            $apellidoUsuario = $paciente->primer_apellido ?? '';
        }

        $nombreCompleto = trim("$nombreUsuario $apellidoUsuario");

        try {
            $token = JWTAuth::fromUser($user);
        }catch (JWTException $e) {
            return response()->json([
                'success'=> false,
                'message'=> 'Error al generar token: ' . $e->getMessage()
            ], 500);
        }

        $expira = auth()->factory()->getTTL() * 60; //Se establece el limite de expiración para el token

        // Múltiples roles asignados
        if (count($rolesAsignados) > 1) {
            return response()->json([
                'success'     => true,
                'elegirRol'   => true,
                'message'     => 'El usuario cuenta con múltiples roles asignados',
                'usuarioReal' => [
                    'id'              => $user->id,
                    'email'           => $user->email,
                    'nombre_completo' => $nombreCompleto,
                    'roles'           => $rolesAsignados
                ],
                'token'      => $token,
                'token_type' => 'bearer',
                'expires_in' => $expira
            ], 200);
        }

        // Rol único
        $responseData = [
            'success' => true,
            'message' => 'Ingreso exitoso',
            'usuario' => [
                'id'              => $user->id,
                'email'           => $user->email,
                'rol'             => $rolesAsignados[0] ?? 'sin_rol',
                'nombre_completo' => $nombreCompleto
            ],
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => $expira
        ];

        /*Ya no
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
        ];*/

        //Guardar en cookie -> Es opcional, ya que también se puede hacer via localStorage, pero mejor asi por lo del móvil
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
