<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class reparation_piece extends Model
{
    use HasFactory, Notifiable;

    protected $fillable =[
        'reparation_id',
        'piece_id',
        'quantite',
        'prix_utilise'
    ];

    public function reparations(){
        return $this->belongsTo(Reparation::class);
    }

    public function pieces(){
        return $this->belongsTo(Piece::class);
    }
}
