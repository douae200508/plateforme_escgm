<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Resultat extends Model
{
    protected $fillable = ['user_id', 'qcm_id', 'note', 'date_passage'];

    public function user(){ return $this->belongsTo(User::class); }
    public function qcm(){ return $this->belongsTo(Qcm::class); }
}