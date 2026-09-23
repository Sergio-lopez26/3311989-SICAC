<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetodoPago extends Model
{
    use HasFactory;
    protected $table = 'metodo_pago';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'nombre_metodo'
    ];
    function pago()
    {
        return $this->hasMany(Pago::class, 'id_metodo_pago');
    }
}
