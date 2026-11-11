<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['role' => 'nullable|in:admin,formateur,stagiaire']);

        $users = User::query()
            ->when($request->role, fn ($q) => $q->where('role', $request->role))
            ->with('groupe:id,nom')
            ->orderBy('nom')
            ->get(['id', 'nom', 'prenom', 'email', 'role', 'groupe_id', 'actif']);

        return response()->json($users);
    }

    // Un mot de passe temporaire est généré (l'admin n'en saisit pas) et
    // renvoyé une seule fois dans la réponse pour qu'il puisse le
    // communiquer à l'utilisateur créé.
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,formateur,stagiaire',
            'groupe_id' => 'nullable|exists:groupes,id',
        ]);

        $motDePasse = Str::random(10);

        $user = User::create([
            ...$data,
            'groupe_id' => $data['role'] === 'admin' ? null : ($data['groupe_id'] ?? null),
            'password' => $motDePasse,
            'actif' => true,
        ]);

        $user->load('groupe:id,nom');

        return response()->json(['user' => $user, 'mot_de_passe_genere' => $motDePasse], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => 'sometimes|required|in:admin,formateur,stagiaire',
            'groupe_id' => 'nullable|exists:groupes,id',
            'actif' => 'sometimes|boolean',
        ]);

        if (($data['role'] ?? $user->role) === 'admin') {
            $data['groupe_id'] = null;
        }

        $user->update($data);

        return response()->json($user->load('groupe:id,nom'));
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
