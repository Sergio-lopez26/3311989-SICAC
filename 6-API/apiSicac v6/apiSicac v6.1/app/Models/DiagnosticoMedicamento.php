<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class DiagnosticoMedicamento extends Pivot
{
    use HasFactory;
    protected $table = 'diagnostico_medicamento';
    public $timestamps = false;
    protected $primaryKey = null;
    public $incrementing = false;
    protected $fillable = [
        'id_diagnostico',
        'id_medicamento',
        'estado_medicacion'
    ];
    protected $casts = [
        'fecha_medicacion' => 'datetime'
    ];

    public function diagnostico()
    {
        return $this->belongsTo(Diagnostico::class, 'id_diagnostico');
    }
    public function medicamento()
    {
        return $this->belongsTo(Medicamento::class, 'id_medicamento');
    }
}
