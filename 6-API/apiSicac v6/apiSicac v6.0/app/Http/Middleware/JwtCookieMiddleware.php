<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class JwtCookieMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        //Si el token esta almacenado en el cookie, se movera al header (Cabecera del doc -sea HTML o Postman-) Authorization
        if ($token = $request->cookie('jwt_token')) {
            $request->headers->set('Authorization', 'Bearer ' . $token); //Se autoriza al token almacenado <-> Importante el espacio después de Bearer dentro de las ''
        }

        return $next($request);
    }
}
