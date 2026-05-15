<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

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
        'cin',
        'role',
        
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
    /**
     * The column used as the password for authentication.
     * Laravel defaults to 'password' but we use 'mdp'.
     */
    public function getAuthPassword()
    {
        return $this->mdp;
    }

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



}
