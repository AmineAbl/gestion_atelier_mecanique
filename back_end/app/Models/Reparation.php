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
}
