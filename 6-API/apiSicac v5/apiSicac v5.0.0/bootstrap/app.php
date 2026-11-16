<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\JwtCookieMiddleware;
use Tymon\JWTAuth\Http\Middleware\Authenticate;
use Tymon\JWTAuth\Http\Middleware\RefreshToken;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //Middleware para grupos
        $middleware->group('api',[
            // \Illuminate\Routing\Middleware\ThrottleRequests::class. ':api', se quita porque no se manejará la tabla cache
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        //Si se usa el middleware de cookie
        //Algo pasaba que no deja cerrar sesión, pero si se comenta, si deja, sin embargo no se puede navegar, ya que el token como que se "desactiva" o no se lee
        $middleware->appendToGroup('api', JwtCookieMiddleware::class);

        //Middleware alias para usar en rutas
        $middleware->alias([
            'jwt.auth' => Authenticate::class,
            'jwt.refresh' => RefreshToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions){
        /*$exceptions->shouldRenderJsonWhen(function ($request) { //Con esto se hace que en el Postman se muestre el mensaje de excepcion en formato json
            return $request->is('api/*') || $request->expectsJson();
        });*/
    })->create();