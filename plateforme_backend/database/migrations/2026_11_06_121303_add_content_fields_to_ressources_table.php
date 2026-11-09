<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Utilisés uniquement quand type = "cours" : le contenu écrit par le
    // formateur/admin pour ce chapitre. La vidéo du cours réutilise les
    // colonnes "url" (lien) et "chemin" (fichier) déjà existantes.
    public function up(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->text('presentation')->nullable()->after('url');
            $table->longText('contenu')->nullable()->after('presentation');
            $table->text('exemples')->nullable()->after('contenu');
            $table->text('resume')->nullable()->after('exemples');
        });
    }

    public function down(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->dropColumn(['presentation', 'contenu', 'exemples', 'resume']);
        });
    }
};
