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
        Schema::create('signalements', function (Blueprint $table) {
           $table->id();
$table->foreignId('expediteur_id')->constrained('users')->cascadeOnDelete();
$table->foreignId('destinataire_id')->nullable()->constrained('users')->nullOnDelete();
$table->string('objet');
$table->text('description');
$table->string('statut')->default('nouveau'); // nouveau / traite
$table->text('reponse')->nullable();
$table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signalements');
    }
};
