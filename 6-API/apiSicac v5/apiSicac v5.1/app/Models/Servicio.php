<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $table = 'servicio';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id',
        'id_tipo_servicio',
        'id_diagnostico',
        'nombre_servicio',
        'procedimiento',
        'precio_aplicado',
        'fecha_servicio'
    ];

    protected $casts = [
        'precio_aplicado' => 'decimal:2',
        'fecha_servicio' => 'datetime'
    ];
}