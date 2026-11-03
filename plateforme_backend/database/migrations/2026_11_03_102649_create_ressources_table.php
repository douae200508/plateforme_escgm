<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ressources', function (Blueprint $table) {
           $table->id();
$table->foreignId('chapitre_id')->constrained()->cascadeOnDelete();
$table->string('titre');
$table->enum('type', ['cours','video','image','lien','qcm',
    'correction_qcm','tp','correction_tp','evaluation','correction_evaluation']);
$table->string('chemin')->nullable();   // fichier déposé
$table->string('url')->nullable();      // pour le type "lien"
$table->integer('ordre')->default(0);
$table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ressources');
    }
};
