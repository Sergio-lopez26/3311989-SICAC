<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TipoCita extends Model
{
    use HasFactory;
    protected $table = 'tipo_cita';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'tipo_cita'
    ];

    function cita()
    {
        return $this->hasMany(Cita::class, 'id_tipo_cita');
    }
}
