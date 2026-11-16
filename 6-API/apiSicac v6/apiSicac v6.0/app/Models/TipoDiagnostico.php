<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoDiagnostico extends Model
{
    use HasFactory;
    protected $table = 'tipo_diagnostico';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'nombre_diagnostico',
        'descripcion'
    ];
    public function diagnostico()
    {
        return $this->hasMany(Diagnostico::class, 'id_tipo_diagnostico');
    }
}
