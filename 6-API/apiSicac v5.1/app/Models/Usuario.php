<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; //Librería para HasFactory
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject; //Importa la interfaz de JWT

class Usuario extends Authenticatable implements JWTSubject
{
    use HasFactory;

    protected $table = 'usuario';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id',
        'email',
        'password'
    ];

    /*protected $hidden = [
        'password'
    ];*/

    public function getAuthPassword()
    {
        return $this->password;
    }

    public function roles()
    {
        return $this->belongsToMany(
            Rol::class,
            'rol_usuario', //Esta es la tabla intermedia entre Usuario y Rol -> Por lo de N a N
            'id_usuario', //FK de Usuario en rol_usuario
            'id_rol' //FK de Rol en rol_usuario
            //'id', Llave local en usuario
            //'id', Llave local en rol
        );
    }
    //Métodos requeridos por JWT
    //Aquí se genera un JWT del que el sistema necesita saber su valor y a que ID de usuario le pertenece
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    //Devuelve un array con la info "no tan importante" almacenada ->uso de Claims (Reclamos)
    public function getJWTCustomClaims()
    {
        return [
            'id_usuario' => $this->id,
            'roles' => $this->roles->pluck('rol')->toArray()
        ];
    }
}
