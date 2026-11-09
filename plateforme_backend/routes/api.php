<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\FormationController;
use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\ChapitreController;
use App\Http\Controllers\Admin\RessourceController;
use App\Http\Controllers\Admin\ResultatController;
use App\Http\Controllers\Admin\QcmController;
use App\Http\Controllers\Admin\GroupeController;
use App\Http\Controllers\Admin\UserController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/formations', [FormationController::class, 'index']);
    Route::post('/formations', [FormationController::class, 'store']);
    Route::put('/formations/{formation}', [FormationController::class, 'update']);
    Route::delete('/formations/{formation}', [FormationController::class, 'destroy']);

    Route::get('/modules', [ModuleController::class, 'index']);
    Route::post('/modules', [ModuleController::class, 'store']);
    Route::put('/modules/{module}', [ModuleController::class, 'update']);
    Route::delete('/modules/{module}', [ModuleController::class, 'destroy']);
    Route::post('/modules/reorder', [ModuleController::class, 'reorder']);

    Route::post('/chapitres', [ChapitreController::class, 'store']);
    Route::get('/chapitres/{chapitre}', [ChapitreController::class, 'show']);
    Route::put('/chapitres/{chapitre}', [ChapitreController::class, 'update']);
    Route::delete('/chapitres/{chapitre}', [ChapitreController::class, 'destroy']);
    Route::post('/chapitres/reorder', [ChapitreController::class, 'reorder']);
    Route::post('/chapitres/{chapitre}/ressources', [ChapitreController::class, 'storeRessource']);
    Route::put('/chapitres/{chapitre}/ressources/{ressource}', [ChapitreController::class, 'updateRessource']);
    Route::delete('/chapitres/{chapitre}/ressources/{ressource}', [ChapitreController::class, 'destroyRessource']);

    Route::get('/ressources', [RessourceController::class, 'index']);
    Route::post('/ressources', [RessourceController::class, 'store']);
    Route::put('/ressources/{ressource}', [RessourceController::class, 'update']);
    Route::delete('/ressources/{ressource}', [RessourceController::class, 'destroy']);

    Route::get('/resultats/stats', [ResultatController::class, 'stats']);

    Route::get('/chapitres', [ChapitreController::class, 'index']);

    Route::get('/qcms', [QcmController::class, 'index']);
    Route::post('/qcms', [QcmController::class, 'store']);
    Route::get('/qcms/{qcm}', [QcmController::class, 'show']);
    Route::put('/qcms/{qcm}', [QcmController::class, 'update']);
    Route::delete('/qcms/{qcm}', [QcmController::class, 'destroy']);

    Route::get('/groupes', [GroupeController::class, 'index']);
    Route::post('/groupes', [GroupeController::class, 'store']);
    Route::get('/groupes/{groupe}', [GroupeController::class, 'show']);
    Route::put('/groupes/{groupe}', [GroupeController::class, 'update']);
    Route::delete('/groupes/{groupe}', [GroupeController::class, 'destroy']);
    Route::post('/groupes/{groupe}/formateurs', [GroupeController::class, 'assignFormateur']);
    Route::delete('/groupes/{groupe}/formateurs/{user}', [GroupeController::class, 'removeFormateur']);
    Route::post('/groupes/{groupe}/stagiaires', [GroupeController::class, 'assignStagiaire']);
    Route::delete('/groupes/{groupe}/stagiaires/{user}', [GroupeController::class, 'removeStagiaire']);

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'role:formateur,admin'])->group(function () {
    // routes accessibles aux formateurs et admins
});