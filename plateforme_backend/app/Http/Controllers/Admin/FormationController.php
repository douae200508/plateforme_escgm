<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Formation;
use Illuminate\Http\Request;

class FormationController extends Controller
{
    // Les statuts possibles pour une formation (affichés comme badges côté
    // front) — centralisés ici pour que validation et valeur par défaut
    // restent cohérentes.
    private const STATUTS = ['Publiée', 'Brouillon', 'Masquée', 'Archivée'];

    public function index()
    {
        // withCount ajoute automatiquement un champ "modules_count" sans
        // charger chaque module individuellement (une seule requête SQL).
        $formations = Formation::withCount('modules')
            ->with('groupes')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function ($f) {
                // Pas de relation directe Formation -> stagiaires : on passe
                // par les groupes de la formation et on additionne.
                $f->stagiaires_count = $f->groupes->sum(fn ($g) => $g->stagiaires()->count());
                unset($f->groupes);
                return $f;
            });

        return response()->json($formations);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'statut' => 'nullable|in:' . implode(',', self::STATUTS),
        ]);

        $data['statut'] = $data['statut'] ?? 'Brouillon';

        $formation = Formation::create($data);

        return response()->json($formation, 201);
    }

    public function update(Request $request, Formation $formation)
    {
        $data = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'statut' => 'sometimes|in:' . implode(',', self::STATUTS),
        ]);

        $formation->update($data);

        return response()->json($formation);
    }

    public function destroy(Formation $formation)
    {
        $formation->delete();

        return response()->json(['message' => 'Formation supprimée.']);
    }
}
