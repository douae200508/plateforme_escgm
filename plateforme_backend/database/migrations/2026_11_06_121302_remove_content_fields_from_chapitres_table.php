<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Le contenu pédagogique (présentation/contenu/exemples/vidéo/résumé)
    // appartient à la Ressource "cours" du chapitre, pas au chapitre
    // lui-même — voir 2026_11_06_121303_add_content_fields_to_ressources_table.
    public function up(): void
    {
        Schema::table('chapitres', function (Blueprint $table) {
            $table->dropColumn(['presentation', 'contenu', 'exemples', 'video_url', 'video_chemin', 'resume']);
        });
    }

    public function down(): void
    {
        Schema::table('chapitres', function (Blueprint $table) {
            $table->text('presentation')->nullable()->after('statut');
            $table->longText('contenu')->nullable()->after('presentation');
            $table->text('exemples')->nullable()->after('contenu');
            $table->string('video_url')->nullable()->after('exemples');
            $table->string('video_chemin')->nullable()->after('video_url');
            $table->text('resume')->nullable()->after('video_chemin');
        });
    }
};
