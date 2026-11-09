<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Chapitre extends Model
{
    protected $fillable = ['module_id', 'titre', 'ordre', 'statut'];

    public function module(){ return $this->belongsTo(Module::class); }
    public function ressources(){ return $this->hasMany(Ressource::class); }
    public function contenus(){ return $this->ressources()->whereNotIn('type', ['qcm'])->orderBy('ordre'); }
}