<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Vehicule extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'marque',
        'modele',
        'immat',
        'carb',
        'transmission',
        'annee',
        'client_id',
    ];
    

     public function client()
    {
        return $this->belongsTo(Client::class);
    }

     public function reparations()
    {
        return $this->hasMany(Reparation::class);
    }

     public function factures()
    {
        return $this->hasMany(Facture::class);
    }
}
