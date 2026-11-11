<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    protected $fillable = ['module_id', 'titre', 'sujet', 'corrige'];

    public function module(){ return $this->belongsTo(Module::class); }
}
