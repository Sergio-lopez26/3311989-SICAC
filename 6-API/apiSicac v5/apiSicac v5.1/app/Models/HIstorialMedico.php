<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class HIstorialMedico extends Model
{
    use HasFactory;

    protected $table = 'historial_medico';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id_paciente',
        'antecedentes_medicos',
    ];
    protected $casts=[
        'fecha_creacion'=>'datetime'
    ];
}