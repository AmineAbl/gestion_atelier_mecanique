<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Piece extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
       'nom',
       'prix',
       'quantite' 
    ];

    public function reparations()
    {
        return $this->belongsToMany(Reparation::class, 'reparation_pieces')
            ->withPivot('quantite', 'prix_utilise')
            ->withTimestamps();
    }
}
