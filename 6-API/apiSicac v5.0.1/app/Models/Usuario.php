<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; //Librería para HasFactory

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    use HasFactory;

    protected $table = 'usuario';
    public $timestamps = false;
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    protected $fillable = [
        'id',
        'email',
        'password'
    ];
}
