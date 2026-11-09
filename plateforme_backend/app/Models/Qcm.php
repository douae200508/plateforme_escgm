<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Qcm extends Model
{
    protected $fillable = ['ressource_id', 'titre', 'token', 'seuil_reussite', 'nombre_tentatives', 'afficher_correction'];

    protected $casts = ['afficher_correction' => 'boolean'];

    public function ressource(){ return $this->belongsTo(Ressource::class); }
    public function questions(){ return $this->hasMany(Question::class); }
    public function resultats(){ return $this->hasMany(Resultat::class); }
}
