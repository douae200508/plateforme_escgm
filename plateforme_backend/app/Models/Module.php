<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = ['formation_id', 'titre', 'ordre'];

    public function formation(){ return $this->belongsTo(Formation::class); }
    public function chapitres(){ return $this->hasMany(Chapitre::class); }
}