<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('qcms', function (Blueprint $table) {
            $table->boolean('afficher_correction')->default(false)->after('nombre_tentatives');
        });
    }

    public function down(): void
    {
        Schema::table('qcms', function (Blueprint $table) {
            $table->dropColumn('afficher_correction');
        });
    }
};
