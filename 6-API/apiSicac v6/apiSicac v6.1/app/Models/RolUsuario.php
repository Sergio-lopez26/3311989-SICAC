<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot; //Se cambia Model por Pivot, ya que esta tabla es una intermedia que conecta otras 2 tablas

class RolUsuario extends Pivot
{
    protected $table = 'rol_usuario';
    public $timestamps = false;
    //Al ser tabla intermedia pura, se aplican cambios en la estructura de su Modelo
    protected $primaryKey = null;
    public $incrementing = false;
    protected $fillable = [
        'id_rol',
        'id_usuario'
    ];

    //Funcion pública que indica que id_rol hace alusión a un resgistro de Rol
    public function rol(){
        return $this->belongsTo(Rol::class, 'id_rol');
    }

    //Funcion pública que indica que id_usuario hace alusión a un registro de Usuario
    public function usuario(){
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
