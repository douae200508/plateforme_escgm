<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->dropColumn(['presentation', 'contenu', 'exemples', 'resume']);
            $table->text('description')->nullable()->after('url');
        });
    }

    public function down(): void
    {
        Schema::table('ressources', function (Blueprint $table) {
            $table->dropColumn('description');
            $table->text('presentation')->nullable()->after('url');
            $table->longText('contenu')->nullable()->after('presentation');
            $table->text('exemples')->nullable()->after('contenu');
            $table->text('resume')->nullable()->after('exemples');
        });
    }
};
