<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Reparation extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
       'descrpition',
       'statut',
       'date_debut',
       'date_fin',
       'date_prevue_fin',
       'cout'
    ];


    public function vehicules(){
        return $this->belongsTo(Vehicule::class);
    }

    public function users(){
        return $this->belongsTo(User::class);
    }

    public function factures(){
        return $this->belongsTo(Facture::class);
    }

    public function pieces(){
        return $this->belongsToMany(Piece::class);
    }
}
