<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    protected $fillable = ['titre', 'description', 'image', 'statut'];

    public function modules(){ return $this->hasMany(Module::class); }
    public function groupes(){ return $this->hasMany(Groupe::class); }
}