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
        Schema::create('notifications', function (Blueprint $table) {
           $table->id();
$table->foreignId('user_id')->constrained()->cascadeOnDelete();
$table->enum('type', ['message', 'signalement']);
$table->unsignedBigInteger('source_id'); // id du message ou du signalement
$table->string('titre')->nullable();
$table->text('contenu')->nullable();
$table->boolean('lu')->default(false);
$table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
