<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reparation_pieces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reparation_id')->constrained('reparations')->onDelete('cascade');
            $table->foreignId('piece_id')->constrained('pieces')->onDelete('cascade');

            $table->integer('quantite');
            $table->float('prix_utilise');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reparation_pieces');
    }
};
