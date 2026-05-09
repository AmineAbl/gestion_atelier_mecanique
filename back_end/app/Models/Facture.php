<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Facture extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
       'total_piece',
       'cout',
       'prix_total',
       'date_validation',
       'statut',
       'reparation_id',
       'user_id'
    ];


    public function users(){
        return $this->belongsTo(User::class);
    }

    public function reparations(){
        return $this->hasOne(Reparation::class);
    }
}
