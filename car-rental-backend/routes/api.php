<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DriverController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
Route::get('/reports/revenue', [ReportController::class, 'revenue']);
Route::get('/reports/utilization', [ReportController::class, 'utilization']);

Route::get('/notifications', [NotificationController::class, 'index']);
Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

Route::apiResource('cars', CarController::class);
Route::apiResource('customers', CustomerController::class);
Route::apiResource('bookings', BookingController::class);
Route::apiResource('users', UserController::class);
Route::apiResource('drivers', DriverController::class);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me']);
Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
