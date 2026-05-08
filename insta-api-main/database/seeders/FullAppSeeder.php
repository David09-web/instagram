<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use App\Models\Post;
use App\Models\Story;
use Carbon\Carbon;

class FullAppSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Asegurar el usuario maestro
        $master = User::updateOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'David Master', 'password' => bcrypt('password123')]
        );
        Profile::updateOrCreate(['user_id' => $master->id], [
            'username' => 'david_master',
            'bio' => 'Creador de la app',
            'avatar' => 'https://i.pravatar.cc/150?u=master'
        ]);

        // 2. Crear 5 amigos
        $friendsData = [
            ['name' => 'Ana Garcia', 'email' => 'ana@example.com', 'username' => 'ana_dev'],
            ['name' => 'Carlos Perez', 'email' => 'carlos@example.com', 'username' => 'perez.c'],
            ['name' => 'Elena Rodriguez', 'email' => 'elena@example.com', 'username' => 'elena_art'],
            ['name' => 'Roberto Sanchez', 'email' => 'roberto@example.com', 'username' => 'betos_'],
            ['name' => 'Lucia Fernandez', 'email' => 'lucia@example.com', 'username' => 'lucia_travel'],
        ];

        foreach ($friendsData as $index => $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'], 'password' => bcrypt('password123')]
            );

            Profile::updateOrCreate(['user_id' => $user->id], [
                'username' => $data['username'],
                'bio' => "Hola, soy " . $data['name'],
                'avatar' => "https://i.pravatar.cc/150?u=" . $data['email']
            ]);

            // Hacerlos amigos del maestro
            $master->friends()->syncWithoutDetaching([$user->id => ['status' => 'accepted']]);
            $user->friends()->syncWithoutDetaching([$master->id => ['status' => 'accepted']]);

            // Agregar 2 posts a cada amigo
            for ($i = 1; $i <= 2; $i++) {
                Post::create([
                    'user_id' => $user->id,
                    'image' => "https://picsum.photos/seed/user" . $user->id . "_post$i/800/800",
                    'caption' => "Post número $i de " . $data['username'] . " #InstaClone"
                ]);
            }

            // Agregar una historia activa al menos a 3 amigos
            if ($index < 3) {
                Story::create([
                    'user_id' => $user->id,
                    'image' => "https://picsum.photos/seed/story" . $user->id . "/1080/1920",
                    'expires_at' => Carbon::now()->addHours(24)
                ]);
            }
        }

        // Agregar posts del maestro (si no existen o para demo)
        Post::create([
            'user_id' => $master->id,
            'image' => "https://picsum.photos/seed/master_post1/800/800",
            'caption' => "¡Mi primera foto del día!"
        ]);
    }
}
