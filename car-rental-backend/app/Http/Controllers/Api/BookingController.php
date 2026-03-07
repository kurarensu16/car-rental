<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\Booking::with(['car', 'customer', 'driver'])->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'car_id' => 'required|exists:cars,id',
            'customer_id' => 'required|exists:customers,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'total_price' => 'nullable|numeric',
            'payment_method' => 'nullable|string',
            'payment_status' => 'nullable|string',
            'pickup_location' => 'nullable|string',
            'return_location' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|string',
            'drive_type' => 'nullable|in:Self-Drive,With Driver',
            'driver_id' => 'nullable|exists:drivers,id',
        ]);

        // Generate Booking Reference (e.g., BK-1007)
        $lastBooking = \App\Models\Booking::latest('id')->first();
        $nextId = $lastBooking ? $lastBooking->id + 1 : 1001;
        $validated['booking_reference'] = 'BK-' . $nextId;

        return \App\Models\Booking::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return \App\Models\Booking::with(['car', 'customer', 'driver'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $booking = \App\Models\Booking::findOrFail($id);

        $validated = $request->validate([
            'car_id' => 'sometimes|exists:cars,id',
            'customer_id' => 'sometimes|exists:customers,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'total_price' => 'sometimes|numeric',
            'payment_method' => 'sometimes|string',
            'payment_status' => 'sometimes|string',
            'pickup_location' => 'sometimes|string',
            'return_location' => 'sometimes|string',
            'notes' => 'sometimes|string',
            'status' => 'sometimes|string',
            'drive_type' => 'sometimes|in:Self-Drive,With Driver',
            'driver_id' => 'nullable|exists:drivers,id',
        ]);

        $booking->update($validated);

        // If status changed to Completed or Cancelled, update Car status
        if (isset($validated['status'])) {
            $car = $booking->car;
            if ($validated['status'] === 'Completed' || $validated['status'] === 'Cancelled') {
                $car->update(['status' => 'Available']);
            } elseif ($validated['status'] === 'Active') {
                $car->update(['status' => 'Rented']);
            }
        }

        return $booking;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $booking = \App\Models\Booking::findOrFail($id);
        $booking->delete();
        return response()->json(null, 204);
    }
}
