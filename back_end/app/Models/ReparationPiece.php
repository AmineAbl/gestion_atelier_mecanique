<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReparationPiece extends Model
{
    protected $table = 'reparation_pieces';

    protected $fillable = [
        'reparation_id',
        'piece_id',
        'quantite',
        'prix_utilise',
    ];

    public function reparation(): BelongsTo
    {
        return $this->belongsTo(Reparation::class);
    }

    public function piece(): BelongsTo
    {
        return $this->belongsTo(Piece::class);
    }
}
