<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['user_id', 'type', 'source_id', 'titre', 'contenu', 'lu'];

    public function user(){ return $this->belongsTo(User::class); }
}