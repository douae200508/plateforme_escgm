<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'role',
        'actif',
        'groupe_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'actif' => 'boolean',
    ];

    // ---- Relations ----

    // Stagiaire : appartient à un groupe
    public function groupe()
    {
        return $this->belongsTo(Groupe::class);
    }

    // Résultats de QCM obtenus par le stagiaire
    public function resultats()
    {
        return $this->hasMany(Resultat::class);
    }

    // Messages envoyés / reçus
    public function messagesEnvoyes()
    {
        return $this->hasMany(Message::class, 'expediteur_id');
    }

    public function messagesRecus()
    {
        return $this->hasMany(Message::class, 'destinataire_id');
    }

    // Signalements émis (formateur) / reçus (admin)
    public function signalementsEmis()
    {
        return $this->hasMany(Signalement::class, 'expediteur_id');
    }

    public function signalementsRecus()
    {
        return $this->hasMany(Signalement::class, 'destinataire_id');
    }

    // Notifications reçues
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}