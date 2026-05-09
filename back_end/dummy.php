<?php
$client = DB::table('clients')->first();
if ($client) {
    $vehiculeId = DB::table('vehicules')->insertGetId([
        'marque' => 'Toyota',
        'modele' => 'Corolla',
        'annee' => '2020-01-01',
        'immat' => 'AB-123-CD',
        'carb' => 'Essence',
        'transmission' => 'Automatique',
        'client_id' => $client->id,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    
    DB::table('reparations')->insert([
        'description' => 'Changement plaquettes de frein',
        'statut' => 'completed',
        'date_debut' => '2026-05-01',
        'date_fin' => '2026-05-02',
        'date_prevue_fin' => '2026-05-02',
        'cout' => 1500,
        'vehicule_id' => $vehiculeId,
        'user_id' => 1,
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "Dummy data created successfully!";
} else {
    echo "No clients found to attach vehicle to.";
}
