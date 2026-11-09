<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Qcm;
use App\Models\Resultat;

class ResultatController extends Controller
{
    // Taux de réussite global (toutes formations confondues) pour le
    // tableau de bord : chaque couple (stagiaire, QCM) est classé Réussi /
    // En cours / Échoué selon son meilleur score face au seuil du QCM et à
    // son nombre de tentatives restantes.
    public function stats()
    {
        $resultats = Resultat::select('user_id', 'qcm_id', 'note')->get();

        if ($resultats->isEmpty()) {
            return response()->json(['reussis' => 0, 'en_cours' => 0, 'echoues' => 0, 'total' => 0]);
        }

        $qcms = Qcm::with('questions:id,qcm_id,points')->get()->keyBy('id');

        $counts = ['Réussi' => 0, 'En cours' => 0, 'Échoué' => 0];

        $resultats
            ->groupBy(fn ($r) => $r->user_id . '-' . $r->qcm_id)
            ->each(function ($attempts) use ($qcms, &$counts) {
                $qcm = $qcms->get($attempts->first()->qcm_id);
                if (! $qcm) {
                    return;
                }

                $totalPoints = $qcm->questions->sum('points') ?: 1;
                $meilleurScorePct = $attempts->max('note') / $totalPoints * 100;
                $tentatives = $attempts->count();

                if ($meilleurScorePct >= $qcm->seuil_reussite) {
                    $counts['Réussi']++;
                } elseif ($qcm->nombre_tentatives !== null && $tentatives >= $qcm->nombre_tentatives) {
                    $counts['Échoué']++;
                } else {
                    $counts['En cours']++;
                }
            });

        return response()->json([
            'reussis' => $counts['Réussi'],
            'en_cours' => $counts['En cours'],
            'echoues' => $counts['Échoué'],
            'total' => array_sum($counts),
        ]);
    }
}
