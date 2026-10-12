<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class Medico extends Model
{
    use HasFactory;

    protected $table = 'medico';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id',
        'id_usuario',
        'id_tipo_documento',
        'numero_documento',
        'email',
        'password',
        'nombres',
        'apellidos',
        'matricula_profesional',
        'numero_celular',
        'fecha_registro',
        'estado_medico'
    ];

    public function cita()
    {
        return $this->hasMany(Cita::class, 'id_medico');
    }
}
