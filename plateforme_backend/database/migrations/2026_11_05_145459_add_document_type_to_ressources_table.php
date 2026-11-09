<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // "document" (pièce jointe générique d'un chapitre : PDF, Word...) n'était
    // pas prévu dans l'enum d'origine — ajouté pour la section "Documents du
    // chapitre" de l'éditeur pédagogique.
    public function up(): void
    {
        DB::statement("ALTER TABLE ressources MODIFY type ENUM('cours','video','image','lien','document','qcm','correction_qcm','tp','correction_tp','evaluation','correction_evaluation')");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE ressources MODIFY type ENUM('cours','video','image','lien','qcm','correction_qcm','tp','correction_tp','evaluation','correction_evaluation')");
    }
};
