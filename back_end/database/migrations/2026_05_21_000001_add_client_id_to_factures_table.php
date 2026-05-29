<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add client_id column to factures table for direct client reference
     * This improves performance and ensures client data is preserved
     */
    public function up(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            // Add client_id as a foreign key if it doesn't exist
            if (!Schema::hasColumn('factures', 'client_id')) {
                $table->foreignId('client_id')
                    ->nullable()
                    ->constrained('clients')
                    ->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            if (Schema::hasColumn('factures', 'client_id')) {
                $table->dropForeignKeyIfExists('factures_client_id_foreign');
                $table->dropColumn('client_id');
            }
        });
    }
};
