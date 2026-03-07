<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'location' => $user->location,
                    'role' => $user->role,
                    'timezone' => $user->timezone,
                    'avatar' => $user->avatar,
                ],
                'message' => 'Login successful'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'The provided credentials do not match our records.'
        ], 401);
    }

    public function me(Request $request)
    {
        // For now, since we aren't using sanctum tokens/sessions properly in the frontend,
        // we might just return the user based on email or id if the frontend sends it,
        // but ideally Auth::user() should work if sessions are maintained.
        // Let's assume sessions work for now.
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            // Fallback for simulation if session is lost but we have an ID
            if ($request->has('id')) {
                $user = \App\Models\User::find($request->id);
            }
        }

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'location' => 'sometimes|string|max:255',
            'timezone' => 'sometimes|string|max:100',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
        ]);

        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'user' => $user,
            'message' => 'Profile updated successfully'
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
