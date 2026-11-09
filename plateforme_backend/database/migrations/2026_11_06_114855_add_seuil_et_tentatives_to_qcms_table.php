<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('qcms', function (Blueprint $table) {
            $table->unsignedTinyInteger('seuil_reussite')->default(50)->after('titre');
            $table->unsignedTinyInteger('nombre_tentatives')->nullable()->after('seuil_reussite');
        });
    }

    public function down(): void
    {
        Schema::table('qcms', function (Blueprint $table) {
            $table->dropColumn(['seuil_reussite', 'nombre_tentatives']);
        });
    }
};
