<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Reparation extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'description',
        'statut',
        'date_debut',
        'date_fin',
        'date_prevue_fin',
        'cout',
        'vehicule_id',
        'user_id',
    ];

    public function vehicule()
    {
        return $this->belongsTo(Vehicule::class);
    }

    public function mecanicien()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }

    public function pieces()
    {
        return $this->belongsToMany(Piece::class, 'reparation_pieces')
            ->withPivot('quantite', 'prix_utilise')
            ->withTimestamps();
    }
}
