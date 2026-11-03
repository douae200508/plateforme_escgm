<?php 
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // routes de gestion réservées à l'admin
});

Route::middleware(['auth:sanctum', 'role:formateur,admin'])->group(function () {
    // routes accessibles aux formateurs et admins
});