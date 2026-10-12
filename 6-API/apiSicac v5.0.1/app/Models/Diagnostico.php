<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Diagnostico extends Model
{
    use HasFactory;
    protected $table = 'diagnostico';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id_cita',
        'id_tipo_diagnostico',
        'motivo',
        'observaciones',
        'tratamiento_sugerido'
    ];
    protected $casts = [
        'fecha_creacion' => 'datetime'
    ];

    
    public function cita(){
        return $this->belongsTo(Cita::class, 'id_cita');
    }
    public function tipo_diagnostico()
    {
        return $this->belongsTo(TipoDiagnostico::class, 'id_tipo_diagnostico');
    }
}
