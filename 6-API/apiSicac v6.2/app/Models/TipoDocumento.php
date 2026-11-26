<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; //Librería para HasFactory

use Illuminate\Database\Eloquent\Model;

class TipoDocumento extends Model
{
    use HasFactory; //HasFactory puede ejecutar una sola línea de código en Laravel que diga, Ejemplo: Producto::factory()->count(100)->create();

    protected $table = 'tipo_documento';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id',
        'sigla',
        'nombre_documento'
    ];
}
