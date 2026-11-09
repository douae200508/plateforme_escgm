<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['role' => 'nullable|in:admin,formateur,stagiaire']);

        $users = User::query()
            ->when($request->role, fn ($q) => $q->where('role', $request->role))
            ->orderBy('nom')
            ->get(['id', 'nom', 'prenom', 'email', 'role', 'groupe_id', 'actif']);

        return response()->json($users);
    }
}
