<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ressource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RessourceController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['formation_id' => 'required|exists:formations,id']);

        $ressources = Ressource::whereNotIn('type', ['qcm'])
            ->whereHas('chapitre.module', fn ($q) => $q->where('formation_id', $request->formation_id))
            ->with('chapitre:id,titre')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($ressources);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'chapitre_id' => 'required|exists:chapitres,id',
            'titre' => 'required|string|max:255',
            'format' => 'required|in:PDF,VID,IMG,PPT',
            'telechargement' => 'nullable|boolean',
            'fichier' => 'required|file|max:204800',
        ]);

        $path = $data['fichier']->store('ressources', 'public');

        $ressource = Ressource::create([
            'chapitre_id' => $data['chapitre_id'],
            'titre' => $data['titre'],
            'type' => 'document',
            'format' => $data['format'],
            'telechargement' => $data['telechargement'] ?? true,
            'taille' => $data['fichier']->getSize(),
            'chemin' => $path,
        ]);

        return response()->json($ressource->load('chapitre:id,titre'), 201);
    }

    public function update(Request $request, Ressource $ressource)
    {
        $data = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
            'chapitre_id' => 'sometimes|required|exists:chapitres,id',
            'format' => 'nullable|in:PDF,VID,IMG,PPT',
            'telechargement' => 'sometimes|boolean',
        ]);

        $ressource->update($data);

        return response()->json($ressource->load('chapitre:id,titre'));
    }

    public function destroy(Ressource $ressource)
    {
        if ($ressource->chemin) {
            Storage::disk('public')->delete($ressource->chemin);
        }

        $ressource->delete();

        return response()->json(['message' => 'Ressource supprimée.']);
    }
}
