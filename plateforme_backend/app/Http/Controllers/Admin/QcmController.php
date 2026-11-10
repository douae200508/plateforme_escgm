<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Qcm;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QcmController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['formation_id' => 'nullable|exists:formations,id']);

        $qcms = Qcm::with('ressource.chapitre:id,titre', 'questions:id,qcm_id,points')
            ->when($request->formation_id, fn ($q) => $q->whereHas('ressource.chapitre.module', fn ($mq) => $mq->where('formation_id', $request->formation_id)))
            ->get()
            ->map(fn ($q) => [
                'id' => $q->id,
                'titre' => $q->titre,
                'chapitre' => $q->ressource?->chapitre,
                'questions_count' => $q->questions->count(),
                'total_points' => $q->questions->sum('points'),
                'afficher_correction' => $q->afficher_correction,
            ]);

        return response()->json($qcms);
    }

    public function show(Qcm $qcm)
    {
        return response()->json($this->format($qcm));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'chapitre_id' => 'required|exists:chapitres,id',
            'titre' => 'required|string|max:255',
        ]);

        $ressource = \App\Models\Ressource::create([
            'chapitre_id' => $data['chapitre_id'],
            'titre' => $data['titre'],
            'type' => 'qcm',
            'ordre' => 0,
        ]);

        $qcm = Qcm::create([
            'ressource_id' => $ressource->id,
            'titre' => $data['titre'],
            'token' => Str::random(24),
            'seuil_reussite' => 70,
            'nombre_tentatives' => 1,
            'afficher_correction' => false,
        ]);

        return response()->json($this->format($qcm), 201);
    }

    public function update(Request $request, Qcm $qcm)
    {
        $data = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'chapitre_id' => 'sometimes|required|exists:chapitres,id',
            'seuil_reussite' => 'sometimes|integer|min:0|max:100',
            'nombre_tentatives' => 'sometimes|integer|min:1',
            'afficher_correction' => 'sometimes|boolean',
            'questions' => 'sometimes|array',
            'questions.*.texte' => 'required_with:questions|string',
            'questions.*.points' => 'required_with:questions|numeric|min:0',
            'questions.*.choix' => 'required_with:questions|array|min:2',
            'questions.*.choix.*.libelle' => 'required_with:questions|string',
            'questions.*.choix.*.correct' => 'sometimes|boolean',
        ]);

        $qcm->update(collect($data)->only(['titre', 'seuil_reussite', 'nombre_tentatives', 'afficher_correction'])->toArray());

        if (isset($data['titre']) || isset($data['chapitre_id'])) {
            $qcm->ressource?->update(collect($data)->only(['titre', 'chapitre_id'])->toArray());
        }

        if (array_key_exists('questions', $data)) {
            $qcm->questions()->delete(); // cascade supprime aussi leurs choix

            foreach ($data['questions'] as $index => $q) {
                $question = $qcm->questions()->create([
                    'enonce' => $q['texte'],
                    'points' => $q['points'],
                    'ordre' => $index,
                ]);

                foreach ($q['choix'] as $choix) {
                    $question->choix()->create([
                        'libelle' => $choix['libelle'],
                        'est_correct' => $choix['correct'] ?? false,
                    ]);
                }
            }
        }

        return response()->json($this->format($qcm->fresh()));
    }

    public function destroy(Qcm $qcm)
    {
        $qcm->ressource?->delete();
        $qcm->delete();

        return response()->json(['message' => 'QCM supprimé.']);
    }

    // Traduit le modèle relationnel (questions -> choix avec est_correct)
    // vers la forme attendue par le front : chaque choix porte son propre
    // indicateur "correct", ce qui permet 0, 1 ou plusieurs bonnes réponses
    // par question (principe Google Forms).
    private function format(Qcm $qcm)
    {
        $qcm->load(['ressource.chapitre.module', 'questions.choix']);

        $chapitre = $qcm->ressource?->chapitre;

        return [
            'id' => $qcm->id,
            'titre' => $qcm->titre,
            'token' => $qcm->token,
            'chapitre_id' => $qcm->ressource?->chapitre_id,
            // Formation/module à plat : nécessaire pour présélectionner les
            // menus en cascade Formation > Module > Chapitre côté front.
            'chapitre' => $chapitre ? [
                'id' => $chapitre->id,
                'titre' => $chapitre->titre,
                'module_id' => $chapitre->module_id,
                'formation_id' => $chapitre->module?->formation_id,
            ] : null,
            'seuil_reussite' => $qcm->seuil_reussite,
            'nombre_tentatives' => $qcm->nombre_tentatives,
            'afficher_correction' => $qcm->afficher_correction,
            'questions' => $qcm->questions->sortBy('ordre')->values()->map(fn ($q) => [
                'id' => $q->id,
                'texte' => $q->enonce,
                'points' => $q->points,
                'choix' => $q->choix->map(fn ($c) => ['libelle' => $c->libelle, 'correct' => $c->est_correct])->values(),
            ])->values(),
        ];
    }
}
