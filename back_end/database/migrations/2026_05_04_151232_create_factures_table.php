<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    /*
    'total_piece',
       'cout',
       'prix_total',
       'date_validation',
       'statut'  */
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->integer('total_piece');
            $table->float('cout');
            $table->float('prix_total');
            $table->date('date_validation');
            $table->string('statut');

            $table->foreignId('reparation_id')->constrained('reparations')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
