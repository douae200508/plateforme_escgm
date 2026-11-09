<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['formation_id' => 'required|exists:formations,id']);

        $modules = Module::where('formation_id', $request->formation_id)
            ->with(['chapitres' => fn ($q) => $q->orderBy('ordre')->select('id', 'module_id', 'titre', 'statut', 'ordre')])
            ->orderBy('ordre')
            ->get();

        return response()->json($modules);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'titre' => 'required|string|max:255',
        ]);

        $data['ordre'] = Module::where('formation_id', $data['formation_id'])->max('ordre') + 1;

        $module = Module::create($data);

        return response()->json($module, 201);
    }

    public function update(Request $request, Module $module)
    {
        $data = $request->validate([
            'titre' => 'sometimes|required|string|max:255',
        ]);

        $module->update($data);

        return response()->json($module);
    }

    public function destroy(Module $module)
    {
        $module->delete();

        return response()->json(['message' => 'Module supprimé.']);
    }

    // Reçoit les ids de modules d'une même formation dans leur nouvel ordre
    // (boutons monter/descendre côté front) et réécrit la colonne "ordre".
    public function reorder(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:modules,id',
        ]);

        foreach ($data['ids'] as $index => $id) {
            Module::where('id', $id)->update(['ordre' => $index]);
        }

        return response()->json(['message' => 'Ordre mis à jour.']);
    }
}
