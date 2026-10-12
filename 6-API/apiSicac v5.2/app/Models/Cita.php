<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cita extends Model
{
    use HasFactory;
    protected $table = 'cita';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable =[
        'id_tipo_cita',
        'id_paciente',
        'id_medico',
        'fecha_cita',
        'hora_inicio',
        'hora_fin',
        'estado_cita'
    ];
    protected $casts = [
    'fecha_cita' => 'date',
    'hora_inicio' => 'datetime:H:i',
    'hora_fin' => 'datetime:H:i',
    ];
    public function diagnostico(){
        return $this->hasOne(Diagnostico::class, 'id_cita');
    }
     public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente');
    }

    //Un agendamiento pertenece a un medico
    public function medico()
    {
        return $this->belongsTo(Medico::class, 'id_medico');
    }


    //Un agendamiento tiene un unico pago asociado
    public function pago()
    {
        return $this->hasOne(Pago::class, 'id_cita');
    }
    public function tipo_cita()
    {
        return $this->belongsTo(TipoCita::class, 'id_tipo_cita');
    }
}
