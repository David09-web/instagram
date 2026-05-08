<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use App\Models\Post;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'David Master', 'password' => bcrypt('password123')]
        );

        Profile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'username' => 'david_master',
                'bio' => 'Bienvenido a mi clon de Instagram',
                'website' => 'https://github.com/david',
                'avatar' => 'https://i.pravatar.cc/150?u=test@example.com'
            ]
        );

        // Crear unos posts de ejemplo
        for ($i = 1; $i <= 3; $i++) {
            Post::create([
                'user_id' => $user->id,
                'image' => "https://picsum.photos/seed/post$i/800/800",
                'caption' => "¡Esta es mi publicación de prueba número $i! #Laravel #Ionic"
            ]);
        }
    }
}
