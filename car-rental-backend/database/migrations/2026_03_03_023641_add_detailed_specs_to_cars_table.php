<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->string('color')->nullable();
            $table->string('fuel_type')->default('Gasoline');
            $table->string('transmission')->default('Automatic');
            $table->integer('seats')->default(5);
            $table->date('registration_expiry')->nullable();
            $table->date('insurance_expiry')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn(['color', 'fuel_type', 'transmission', 'seats', 'registration_expiry', 'insurance_expiry']);
        });
    }
};
