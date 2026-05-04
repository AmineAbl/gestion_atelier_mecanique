<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mdp',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'mdp',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'mdp' => 'hashed',
        ];
    }


    public function isComptable()
    {
        return $this->role === 'comptable';
    }

    public function isResponsable()
    {
        return $this->role === 'responsable';
    }

    public function isMecanicien()
    {
        return $this->role === 'mecanicien';
    }




     public function reparations()
    {
        return $this->hasMany(Reparation::class, 'user_id');
    }


     public function factures()
    {
        return $this->hasMany(Facture::class, 'user_id');
    }


    // Scopes pour filtrer par rôle
    public function scopeComptables($query)
    {
        return $query->where('role', 'comptable');
    }

    public function scopeResponsables($query)
    {
        return $query->where('role', 'responsable');
    }

    public function scopeMecaniciens($query)
    {
        return $query->where('role', 'mecanicien');
    }
}
