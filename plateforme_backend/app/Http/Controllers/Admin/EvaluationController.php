<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EvaluationController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['formation_id' => 'nullable|exists:formations,id']);

        $evaluations = Evaluation::with('module.formation:id,titre')
            ->when($request->formation_id, fn ($q) => $q->whereHas('module', fn ($mq) => $mq->where('formation_id', $request->formation_id)))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($e) => $this->format($e));

        return response()->json($evaluations);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'titre' => 'required|string|max:255',
            'sujet' => 'required|file|max:20480',
            'corrige' => 'nullable|file|max:20480',
        ]);

        $evaluation = Evaluation::create([
            'module_id' => $data['module_id'],
            'titre' => $data['titre'],
            'sujet' => $data['sujet']->store('evaluations', 'public'),
            'corrige' => isset($data['corrige']) ? $data['corrige']->store('evaluations', 'public') : null,
        ]);

        return response()->json($this->format($evaluation), 201);
    }

    // Dépose ou remplace le corrigé d'une évaluation déjà créée (le sujet,
    // lui, ne change pas après coup).
    public function uploadCorrige(Request $request, Evaluation $evaluation)
    {
        $data = $request->validate(['corrige' => 'required|file|max:20480']);

        if ($evaluation->corrige) {
            Storage::disk('public')->delete($evaluation->corrige);
        }

        $evaluation->update(['corrige' => $data['corrige']->store('evaluations', 'public')]);

        return response()->json($this->format($evaluation));
    }

    public function destroy(Evaluation $evaluation)
    {
        if ($evaluation->sujet) {
            Storage::disk('public')->delete($evaluation->sujet);
        }
        if ($evaluation->corrige) {
            Storage::disk('public')->delete($evaluation->corrige);
        }

        $evaluation->delete();

        return response()->json(['message' => 'Évaluation supprimée.']);
    }

    private function format(Evaluation $evaluation)
    {
        $evaluation->load('module.formation:id,titre');

        return [
            'id' => $evaluation->id,
            'titre' => $evaluation->titre,
            'module_id' => $evaluation->module_id,
            'module' => $evaluation->module ? ['id' => $evaluation->module->id, 'titre' => $evaluation->module->titre] : null,
            'formation' => $evaluation->module?->formation,
            'sujet' => $evaluation->sujet,
            'corrige' => $evaluation->corrige,
            'created_at' => $evaluation->created_at,
        ];
    }
}
