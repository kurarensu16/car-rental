<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return \App\Models\Customer::withCount('bookings')
            ->with([
                'bookings' => function ($query) {
                    $query->latest('start_date');
                }
            ])
            ->get()
            ->map(function ($customer) {
                $lastBooking = $customer->bookings->first();
                $customer->last_booking_date = $lastBooking ? $lastBooking->start_date : null;
                $customer->outstanding_balance = $customer->bookings
                    ->where('status', 'Active')
                    ->sum('total_price');
                unset($customer->bookings); // Remove full list to keep response clean
                return $customer;
            });
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:customers',
            'phone' => 'required|string',
            'license_number' => 'required|string|unique:customers',
            'status' => 'nullable|string',
        ]);

        return \App\Models\Customer::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = \App\Models\Customer::withCount('bookings')
            ->with(['bookings.car'])
            ->findOrFail($id);

        $customer->outstanding_balance = $customer->bookings
            ->where('status', 'Active')
            ->sum('total_price');

        return $customer;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $customer = \App\Models\Customer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:customers,email,' . $id,
            'phone' => 'sometimes|string',
            'license_number' => 'sometimes|string|unique:customers,license_number,' . $id,
            'status' => 'sometimes|string',
        ]);

        $customer->update($validated);
        return $customer;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $customer = \App\Models\Customer::findOrFail($id);
        $customer->delete();
        return response()->json(null, 204);
    }
}
