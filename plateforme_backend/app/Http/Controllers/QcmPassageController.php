<?php

namespace App\Http\Controllers;

use App\Models\Qcm;
use App\Models\Resultat;
use Illuminate\Http\Request;

// Accessible à tout utilisateur connecté (pas seulement l'admin) via le
// lien unique du QCM (token) — équivalent du lien "à partager" d'un
// formulaire Google Forms.
class QcmPassageController extends Controller
{
    public function show(Request $request, string $token)
    {
        $qcm = Qcm::where('token', $token)->firstOrFail();
        $qcm->load('questions.choix');

        $tentativesUtilisees = Resultat::where('user_id', $request->user()->id)->where('qcm_id', $qcm->id)->count();

        return response()->json([
            'id' => $qcm->id,
            'titre' => $qcm->titre,
            'nombre_tentatives' => $qcm->nombre_tentatives,
            'tentatives_utilisees' => $tentativesUtilisees,
            'tentatives_restantes' => max(0, $qcm->nombre_tentatives - $tentativesUtilisees),
            // Les choix ne portent pas "correct" ici : le stagiaire ne doit
            // pas voir les bonnes réponses avant de soumettre.
            'questions' => $qcm->questions->sortBy('ordre')->values()->map(fn ($q) => [
                'id' => $q->id,
                'texte' => $q->enonce,
                'points' => $q->points,
                'choix' => $q->choix->map(fn ($c) => ['id' => $c->id, 'libelle' => $c->libelle])->values(),
            ])->values(),
        ]);
    }

    // Notation tout ou rien par question (principe Google Forms) : les
    // cases cochées doivent correspondre exactement aux bonnes réponses
    // pour obtenir les points de la question.
    public function submit(Request $request, string $token)
    {
        $qcm = Qcm::where('token', $token)->firstOrFail();
        $qcm->load('questions.choix');

        $tentativesUtilisees = Resultat::where('user_id', $request->user()->id)->where('qcm_id', $qcm->id)->count();
        if ($tentativesUtilisees >= $qcm->nombre_tentatives) {
            return response()->json(['message' => 'Nombre de tentatives maximal atteint pour ce QCM.'], 422);
        }

        $data = $request->validate([
            'reponses' => 'required|array',
            'reponses.*.question_id' => 'required|integer|exists:questions,id',
            'reponses.*.choix_ids' => 'array',
            'reponses.*.choix_ids.*' => 'integer',
        ]);

        $reponsesParQuestion = collect($data['reponses'])->keyBy('question_id');

        $totalPoints = 0;
        $pointsObtenus = 0;
        $correction = [];

        foreach ($qcm->questions as $question) {
            $totalPoints += $question->points;

            $correctIds = $question->choix->where('est_correct', true)->pluck('id')->sort()->values()->all();
            $soumisIds = collect($reponsesParQuestion->get($question->id)['choix_ids'] ?? [])
                ->map(fn ($v) => (int) $v)->sort()->values()->all();

            $correct = $correctIds === $soumisIds;
            if ($correct) {
                $pointsObtenus += $question->points;
            }

            $correction[] = [
                'question_id' => $question->id,
                'correct' => $correct,
                'choix_corrects' => $qcm->afficher_correction ? $correctIds : null,
            ];
        }

        Resultat::create([
            'user_id' => $request->user()->id,
            'qcm_id' => $qcm->id,
            'note' => $pointsObtenus,
            'date_passage' => now(),
        ]);

        $pourcentage = $totalPoints > 0 ? round($pointsObtenus / $totalPoints * 100) : 0;

        return response()->json([
            'points_obtenus' => $pointsObtenus,
            'total_points' => $totalPoints,
            'pourcentage' => $pourcentage,
            'reussite' => $pourcentage >= $qcm->seuil_reussite,
            'afficher_correction' => $qcm->afficher_correction,
            'correction' => $qcm->afficher_correction ? $correction : null,
        ]);
    }
}
