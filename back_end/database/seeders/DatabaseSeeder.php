<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
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

        // Un seul utilisateur avec le rôle responsable (voir AppServiceProvider).
        User::query()->updateOrCreate(
            ['email' => 'responsable@atelier.com'],
            [
                'nom' => 'Admin',
                'prenom' => 'Responsable',
                'mdp' => Hash::make('password123'),
                'role' => 'responsable',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'comptable@atelier.com'],
            [
                'nom' => 'Compta',
                'prenom' => 'Jean',
                'mdp' => Hash::make('password123'),
                'role' => 'comptable',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'mecanicien@atelier.com'],
            [
                'nom' => 'Garage',
                'prenom' => 'Paul',
                'cin' => 'AB123456',
                'mdp' => Hash::make('password123'),
                'role' => 'mecanicien',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'mecanicien2@atelier.com'],
            [
                'nom' => 'Dupont',
                'prenom' => 'Marc',
                'cin' => 'CD789012',
                'mdp' => Hash::make('password123'),
                'role' => 'mecanicien',
            ]
        );
    }
}
