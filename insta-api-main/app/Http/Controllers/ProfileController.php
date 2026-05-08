<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(User $user)
    {
        $user->load(['profile', 'posts', 'friends']);
        return response()->json($user);
    }

    public function search(Request $request)
    {
        $query = $request->query('q');
        if (!$query) return response()->json([]);

        $users = User::with('profile')
            ->whereHas('profile', function($q) use ($query) {
                $q->where('username', 'like', "%$query%");
            })
            ->orWhere('name', 'like', "%$query%")
            ->limit(5)
            ->get();

        return response()->json($users);
    }
}
