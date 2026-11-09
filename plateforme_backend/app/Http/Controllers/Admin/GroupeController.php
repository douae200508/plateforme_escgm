<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Groupe;
use App\Models\User;
use Illuminate\Http\Request;

class GroupeController extends Controller
{
    public function index()
    {
        $groupes = Groupe::with('formation:id,titre')
            ->withCount(['stagiaires', 'formateurs'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($groupes);
    }

    public function show(Groupe $groupe)
    {
        return response()->json($this->format($groupe));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'formation_id' => 'required|exists:formations,id',
            'nom' => 'required|string|max:255',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
        ]);

        $groupe = Groupe::create($data);

        return response()->json($this->format($groupe), 201);
    }

    public function update(Request $request, Groupe $groupe)
    {
        $data = $request->validate([
            'formation_id' => 'sometimes|required|exists:formations,id',
            'nom' => 'sometimes|required|string|max:255',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
        ]);

        $groupe->update($data);

        return response()->json($this->format($groupe));
    }

    // Les comptes affectés ne sont pas supprimés : la contrainte
    // nullOnDelete sur users.groupe_id les détache automatiquement.
    public function destroy(Groupe $groupe)
    {
        $groupe->delete();

        return response()->json(['message' => 'Groupe supprimé.']);
    }

    public function assignFormateur(Request $request, Groupe $groupe)
    {
        $data = $request->validate(['user_id' => 'required|exists:users,id']);

        $user = User::findOrFail($data['user_id']);
        if ($user->role !== 'formateur') {
            return response()->json(['message' => "Cet utilisateur n'est pas un formateur."], 422);
        }

        $user->update(['groupe_id' => $groupe->id]);

        return response()->json($this->format($groupe->fresh()));
    }

    public function removeFormateur(Groupe $groupe, User $user)
    {
        if ($user->groupe_id === $groupe->id) {
            $user->update(['groupe_id' => null]);
        }

        return response()->json($this->format($groupe->fresh()));
    }

    public function assignStagiaire(Request $request, Groupe $groupe)
    {
        $data = $request->validate(['user_id' => 'required|exists:users,id']);

        $user = User::findOrFail($data['user_id']);
        if ($user->role !== 'stagiaire') {
            return response()->json(['message' => "Cet utilisateur n'est pas un stagiaire."], 422);
        }

        $user->update(['groupe_id' => $groupe->id]);

        return response()->json($this->format($groupe->fresh()));
    }

    public function removeStagiaire(Groupe $groupe, User $user)
    {
        if ($user->groupe_id === $groupe->id) {
            $user->update(['groupe_id' => null]);
        }

        return response()->json($this->format($groupe->fresh()));
    }

    private function format(Groupe $groupe)
    {
        $groupe->load('formation:id,titre', 'formateurs:id,nom,prenom,email,groupe_id', 'stagiaires:id,nom,prenom,email,groupe_id');

        return [
            'id' => $groupe->id,
            'nom' => $groupe->nom,
            'formation_id' => $groupe->formation_id,
            'formation' => $groupe->formation,
            'date_debut' => $groupe->date_debut,
            'date_fin' => $groupe->date_fin,
            'formateurs' => $groupe->formateurs->values(),
            'stagiaires' => $groupe->stagiaires->values(),
        ];
    }
}
