<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    use HasFactory;

    protected $table = 'paciente';
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
        'fecha_nacimiento',
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'numero_celular',
        'tipo_sangre',
        'genero',
        'nombre_acudiente',
        'documento_acudiente',
        'estado_paciente'
    ];
}
