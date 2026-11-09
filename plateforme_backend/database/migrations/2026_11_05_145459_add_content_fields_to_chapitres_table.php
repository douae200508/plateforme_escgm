<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chapitres', function (Blueprint $table) {
            $table->enum('statut', ['Brouillon', 'Publié'])->default('Brouillon')->after('ordre');
            $table->text('presentation')->nullable()->after('statut');
            $table->longText('contenu')->nullable()->after('presentation');
            $table->text('exemples')->nullable()->after('contenu');
            $table->string('video_url')->nullable()->after('exemples');
            $table->string('video_chemin')->nullable()->after('video_url');
            $table->text('resume')->nullable()->after('video_chemin');
        });
    }

    public function down(): void
    {
        Schema::table('chapitres', function (Blueprint $table) {
            $table->dropColumn(['statut', 'presentation', 'contenu', 'exemples', 'video_url', 'video_chemin', 'resume']);
        });
    }
};
