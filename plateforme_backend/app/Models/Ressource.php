<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Ressource extends Model
{
    protected $fillable = ['chapitre_id', 'titre', 'type', 'chemin', 'url', 'ordre'];

    public function chapitre(){ return $this->belongsTo(Chapitre::class); }
    public function qcm(){ return $this->hasOne(Qcm::class); }
}