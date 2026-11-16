<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MapaDental extends Model
{
    use HasFactory;

    protected $table = 'mapa_dental';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id',
        'id_historial_medico',
        'nombre_estandar',
        'observacion_inicial',
        'fecha_registro',
        'estado_mapa_dental'
    ];

    protected $casts = [
        'fecha_registro' => 'datetime'
    ];
}