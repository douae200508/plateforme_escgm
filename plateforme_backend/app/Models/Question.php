<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['qcm_id', 'enonce', 'points', 'ordre'];

    public function qcm(){ return $this->belongsTo(Qcm::class); }
    public function choix(){ return $this->hasMany(Choix::class); }
}