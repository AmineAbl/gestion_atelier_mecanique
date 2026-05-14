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
       'user_id',
       'client_id'
    ];

    protected $casts = [
        'date_validation' => 'datetime',
        'cout' => 'decimal:2',
        'prix_total' => 'decimal:2',
        'total_piece' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reparation()
    {
        return $this->belongsTo(Reparation::class);
    }
}
