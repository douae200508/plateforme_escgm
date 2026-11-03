<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Signalement extends Model
{
    protected $fillable = ['expediteur_id', 'destinataire_id', 'objet', 'description', 'statut', 'reponse'];

    public function expediteur(){ return $this->belongsTo(User::class, 'expediteur_id'); }
    public function destinataire(){ return $this->belongsTo(User::class, 'destinataire_id'); }
}