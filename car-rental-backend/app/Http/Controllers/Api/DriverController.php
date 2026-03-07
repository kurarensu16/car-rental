<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\Driver::withCount('bookings')
            ->orderBy('name')
            ->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:drivers',
            'phone' => 'required|string',
            'license_number' => 'required|string|unique:drivers',
            'status' => 'nullable|string',
        ]);

        return \App\Models\Driver::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return \App\Models\Driver::with('bookings.car', 'bookings.customer')
            ->withCount('bookings')
            ->findOrFail($id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $driver = \App\Models\Driver::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:drivers,email,' . $id,
            'phone' => 'sometimes|string',
            'license_number' => 'sometimes|string|unique:drivers,license_number,' . $id,
            'status' => 'sometimes|string',
        ]);

        $driver->update($validated);
        return $driver;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $driver = \App\Models\Driver::findOrFail($id);
        $driver->delete();
        return response()->json(null, 204);
    }
}
