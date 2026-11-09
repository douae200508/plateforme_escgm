<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            // Classification affichée dans la bibliothèque (PDF/Vidéo/Image/
            // Présentation) — distincte du "type" structurel existant
            // (cours/video/image/lien/document/qcm/...).
            $table->enum('format', ['PDF', 'VID', 'IMG', 'PPT'])->nullable()->after('type');
            $table->boolean('telechargement')->default(true)->after('format');
            $table->unsignedBigInteger('taille')->nullable()->after('telechargement');
        });
    }

    public function down(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->dropColumn(['format', 'telechargement', 'taille']);
        });
    }
};
