<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StoryController extends Controller
{
    public function index(Request $request)
    {
        $userIds = $request->user()->friends()->pluck('users.id')->push($request->user()->id);
        
        $stories = Story::with('user.profile')
            ->whereIn('user_id', $userIds)
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->get();
            
        return response()->json($stories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        $path = $request->file('image')->store('stories', 'public');

        $story = Story::create([
            'user_id' => $request->user()->id,
            'image' => $path,
            'expires_at' => Carbon::now()->addHours(24),
        ]);

        return response()->json($story);
    }
}
