<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Client extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
       'nom',
       'prenom',
       'telephone'
    ];

    public function vehicules()
    {
        return $this->hasMany(Vehicule::class);
    }

    public function reparations()
    {
        return $this->hasManyThrough(Reparation::class, Vehicule::class);
    }


    public function factures()
    {
        return $this->hasMany(Facture::class);
    }
}
