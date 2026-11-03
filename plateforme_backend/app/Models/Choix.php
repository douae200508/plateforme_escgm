<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Choix extends Model
{
    protected $table = 'choix';   // sinon Laravel cherche "choixes"
    protected $fillable = ['question_id', 'libelle', 'est_correct'];

    public function question(){ return $this->belongsTo(Question::class); }
}
