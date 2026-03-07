<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource (Staff only).
     */
    public function index()
    {
        // For now, return all users as "Staff"
        // In a real app, you might filter by role: User::where('role', 'Staff')->get();
        return response()->json(User::all());
    }

    /**
     * Store a newly created resource in storage (Add Staff).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'role' => 'required|string',
            'timezone' => 'nullable|string|max:100',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json([
            'success' => true,
            'user' => $user,
            'message' => 'Staff member added successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(User::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'location' => 'sometimes|string|max:255',
            'role' => 'sometimes|string',
            'timezone' => 'sometimes|string|max:100',
        ]);

        $user->update($data);

        return response()->json([
            'success' => true,
            'user' => $user,
            'message' => 'Staff profile updated'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Staff member removed']);
    }
}
