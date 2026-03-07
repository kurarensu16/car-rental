<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\Car::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'make' => 'required|string',
            'model' => 'required|string',
            'category' => 'required|string',
            'year' => 'required|integer',
            'registration_number' => 'required|string|unique:cars',
            'image_url' => 'nullable|string',
            'status' => 'nullable|string',
            'color' => 'nullable|string',
            'fuel_type' => 'nullable|string',
            'transmission' => 'nullable|string',
            'seats' => 'nullable|integer',
            'registration_expiry' => 'nullable|date',
            'insurance_expiry' => 'nullable|date',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('cars', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        return \App\Models\Car::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return \App\Models\Car::with(['bookings.customer', 'maintenanceLogs'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $car = \App\Models\Car::findOrFail($id);

        $validated = $request->validate([
            'make' => 'sometimes|string',
            'model' => 'sometimes|string',
            'category' => 'sometimes|string',
            'year' => 'sometimes|integer',
            'registration_number' => 'sometimes|string|unique:cars,registration_number,' . $id,
            'image_url' => 'sometimes|string',
            'status' => 'sometimes|string',
            'color' => 'sometimes|string',
            'fuel_type' => 'sometimes|string',
            'transmission' => 'sometimes|string',
            'seats' => 'sometimes|integer',
            'registration_expiry' => 'sometimes|date',
            'insurance_expiry' => 'sometimes|date',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('cars', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        $car->update($validated);
        return $car;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $car = \App\Models\Car::findOrFail($id);
        $car->delete();
        return response()->json(null, 204);
    }
}
