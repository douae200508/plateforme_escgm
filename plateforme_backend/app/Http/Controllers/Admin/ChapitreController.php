<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Chapitre;
use App\Models\Ressource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ChapitreController extends Controller
{
    // Liste globale (toutes formations) utilisée par les sélecteurs qui ne
    // filtrent pas par formation, comme "Chapitre associé" dans GestionQCM.
    public function index()
    {
        $chapitres = Chapitre::with('module.formation:id,titre')
            ->orderBy('module_id')->orderBy('ordre')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'titre' => $c->titre,
                'formation_titre' => $c->module->formation->titre,
                'module_titre' => $c->module->titre,
            ]);

        return response()->json($chapitres);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'titre' => 'required|string|max:255',
            'statut' => 'nullable|in:Brouillon,Publié',
        ]);

        $data['statut'] = $data['statut'] ?? 'Brouillon';
        $data['ordre'] = Chapitre::where('module_id', $data['module_id'])->max('ordre') + 1;

        $chapitre = Chapitre::create($data);

        return response()->json($chapitre, 201);
    }

    public function show(Chapitre $chapitre)
    {
        $chapitre->load(['contenus', 'module.formation']);

        return response()->json($this->withContenus($chapitre));
    }

    public function update(Request $request, Chapitre $chapitre)
    {
        $data = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'statut' => 'sometimes|in:Brouillon,Publié',
        ]);

        $chapitre->update($data);
        $chapitre->load('contenus');

        return response()->json($this->withContenus($chapitre));
    }

    // Aplatit la liste des ressources (hors QCM, géré à part) du chapitre
    // dans la réponse JSON.
    private function withContenus(Chapitre $chapitre)
    {
        return [
            'id' => $chapitre->id,
            'module_id' => $chapitre->module_id,
            'titre' => $chapitre->titre,
            'ordre' => $chapitre->ordre,
            'statut' => $chapitre->statut,
            'ressources' => $chapitre->contenus,
            'module' => $chapitre->module,
        ];
    }

    public function destroy(Chapitre $chapitre)
    {
        $chapitre->delete();

        return response()->json(['message' => 'Chapitre supprimé.']);
    }

    public function reorder(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:chapitres,id',
        ]);

        foreach ($data['ids'] as $index => $id) {
            Chapitre::where('id', $id)->update(['ordre' => $index]);
        }

        return response()->json(['message' => 'Ordre mis à jour.']);
    }

    public function storeRessource(Request $request, Chapitre $chapitre)
    {
        $data = $request->validate([
            'titre' => 'required|string|max:255',
            'type' => 'required|in:cours,document,tp,evaluation',
            'description' => 'nullable|string',
            'fichier' => 'nullable|file|max:20480',
            'url' => 'nullable|string|max:255',
        ]);

        $path = isset($data['fichier']) ? $data['fichier']->store('chapitres/' . $chapitre->id . '/ressources', 'public') : null;

        $ressource = $chapitre->ressources()->create([
            'titre' => $data['titre'],
            'type' => $data['type'],
            'description' => $data['description'] ?? null,
            'chemin' => $path,
            'format' => isset($data['fichier']) ? $this->inferFormat($data['fichier']) : null,
            'taille' => $path ? $data['fichier']->getSize() : null,
            'url' => $data['url'] ?? null,
            'ordre' => $chapitre->ressources()->count(),
        ]);

        return response()->json($ressource, 201);
    }

    public function updateRessource(Request $request, Chapitre $chapitre, Ressource $ressource)
    {
        if ($ressource->chapitre_id !== $chapitre->id) {
            return response()->json(['message' => 'Ressource introuvable pour ce chapitre.'], 404);
        }

        $data = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'url' => 'nullable|string|max:255',
            'fichier' => 'nullable|file|max:20480',
        ]);

        if (isset($data['fichier'])) {
            if ($ressource->chemin) {
                Storage::disk('public')->delete($ressource->chemin);
            }
            $data['chemin'] = $data['fichier']->store('chapitres/' . $chapitre->id . '/ressources', 'public');
            $data['format'] = $this->inferFormat($data['fichier']);
            $data['taille'] = $data['fichier']->getSize();
        }

        $ressource->update(collect($data)->except('fichier')->toArray());

        return response()->json($ressource);
    }

    // Déduit le format utilisé par la bibliothèque (PDF/VID/IMG/PPT) à
    // partir de l'extension du fichier envoyé depuis l'éditeur de chapitre.
    private function inferFormat(\Illuminate\Http\UploadedFile $file): ?string
    {
        return match (strtolower($file->getClientOriginalExtension())) {
            'pdf' => 'PDF',
            'mp4', 'mov', 'avi', 'webm', 'mkv' => 'VID',
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg' => 'IMG',
            'ppt', 'pptx' => 'PPT',
            default => null,
        };
    }

    public function destroyRessource(Chapitre $chapitre, Ressource $ressource)
    {
        if ($ressource->chapitre_id !== $chapitre->id) {
            return response()->json(['message' => 'Ressource introuvable pour ce chapitre.'], 404);
        }

        if ($ressource->chemin) {
            Storage::disk('public')->delete($ressource->chemin);
        }

        $ressource->delete();

        return response()->json(['message' => 'Ressource supprimée.']);
    }
}
