<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TipoMedicamento extends Model
{
    use HasFactory;
    protected $table = 'tipo_medicamento';
    protected $primaryKey = 'id';
    protected $keyType = 'int';
    public $timestamps = false;
    public $incrementing = true;
    protected $fillable = [
        'categoria_medicamento',
    ];
}
