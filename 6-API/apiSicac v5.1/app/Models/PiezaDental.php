<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PiezaDental extends Model
{
    use HasFactory;

    protected $table = 'pieza_dental';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id',
        'id_mapa',
        'nomenclatura_fdi',
        'cuadrante',
        'posicion',
        'estado_inicial',
        'estado_actual'
    ];

    protected $casts = [
        'cuadrante' => 'integer',
        'posicion' => 'integer'
    ];
}