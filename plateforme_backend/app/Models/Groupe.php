<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Groupe extends Model
{
    protected $fillable = ['formation_id', 'nom', 'date_debut', 'date_fin'];

    public function formation(){ return $this->belongsTo(Formation::class); }
    public function stagiaires(){ return $this->hasMany(User::class); }
}