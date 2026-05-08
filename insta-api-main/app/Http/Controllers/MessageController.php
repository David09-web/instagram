<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MessageController extends Controller
{
    /**
     * GET /api/messages/{userId}
     * Devuelve todos los mensajes entre el usuario autenticado y el usuario dado.
     */
    public function index(Request $request, User $user)
    {
        $authId = $request->user()->id;

        $messages = Message::with(['sender.profile', 'receiver.profile'])
            ->where(function ($q) use ($authId, $user) {
                $q->where('sender_id', $authId)->where('receiver_id', $user->id);
            })
            ->orWhere(function ($q) use ($authId, $user) {
                $q->where('sender_id', $user->id)->where('receiver_id', $authId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Marcar como leídos los mensajes recibidos
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $authId)
            ->whereNull('read_at')
            ->update(['read_at' => Carbon::now()]);

        return response()->json($messages);
    }

    /**
     * POST /api/messages/{userId}
     * Envía un mensaje al usuario dado.
     */
    public function store(Request $request, User $user)
    {
        $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $user->id,
            'body'        => $request->body,
        ]);

        $message->load(['sender.profile', 'receiver.profile']);

        return response()->json($message, 201);
    }

    /**
     * GET /api/conversations
     * Devuelve la lista de usuarios con quienes el auth user tiene mensajes,
     * con el último mensaje de cada conversación.
     */
    public function conversations(Request $request)
    {
        $authId = $request->user()->id;

        // IDs de usuarios con quienes hay conversación
        $partnerIds = Message::where('sender_id', $authId)
            ->orWhere('receiver_id', $authId)
            ->selectRaw('CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as partner_id', [$authId])
            ->groupBy('partner_id')
            ->pluck('partner_id')
            ->unique();

        $conversations = $partnerIds->map(function ($partnerId) use ($authId) {
            $partner = User::with('profile')->find($partnerId);

            $lastMessage = Message::where(function ($q) use ($authId, $partnerId) {
                    $q->where('sender_id', $authId)->where('receiver_id', $partnerId);
                })
                ->orWhere(function ($q) use ($authId, $partnerId) {
                    $q->where('sender_id', $partnerId)->where('receiver_id', $authId);
                })
                ->latest()
                ->first();

            $unread = Message::where('sender_id', $partnerId)
                ->where('receiver_id', $authId)
                ->whereNull('read_at')
                ->count();

            return [
                'user'         => $partner,
                'last_message' => $lastMessage,
                'unread'       => $unread,
            ];
        })->sortByDesc(fn($c) => optional($c['last_message'])->created_at)->values();

        return response()->json($conversations);
    }
}
