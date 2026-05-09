<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('email')->nullable()->after('telephone');
        });

        Schema::table('factures', function (Blueprint $table) {
            $table->date('date_validation')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('email');
        });

        Schema::table('factures', function (Blueprint $table) {
            $table->date('date_validation')->nullable(false)->change();
        });
    }
};
