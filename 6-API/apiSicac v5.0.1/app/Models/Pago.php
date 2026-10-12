<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;

    protected $table = 'pago';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id_cita',
        'id_metodo_pago',
        'numero_pago',
        'monto_pagado',
        'estado_pago',
        'fecha_pago'
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_pago' => 'datetime',
        'fecha_registro' => 'datetime'
    ];

    //Un pago pertenece a un agendamiento
    public function cita()
    {
        return $this->belongsTo(Cita::class, 'id_cita');
    }
    public function metodo_pago()
    {
        return $this->belongsTo(MetodoPago::class, 'id_metodo_pago');
    }
}
