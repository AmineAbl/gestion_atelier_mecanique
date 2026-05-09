<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ============================================================
        // CREATE DEFAULT COMPTABLE (ACCOUNTANT) USER
        // ============================================================
        // Default credentials for testing:
        // Email: comptable@gmail.com
        // Password: 12345
        // Role: comptable
        // ============================================================

        // Check if comptable user already exists
        $existingUser = User::where('email', 'comptable@gmail.com')->first();

        if (!$existingUser) {
            User::create([
                'nom'    => 'Comptable',
                'prenom' => 'Admin',
                'email'  => 'comptable@gmail.com',
                'mdp'    => '12345',   // The 'hashed' cast on the model auto-hashes this
                'role'   => 'comptable',
            ]);

            echo "✓ Comptable user created successfully\n";
        } else {
            echo "✓ Comptable user already exists\n";
        }

        // Additional test users can be added here for other roles
        // (e.g., mechanic, manager) but NOT as per user requirements
    }
}

