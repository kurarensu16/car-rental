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
            if (!Schema::hasColumn('cars', 'color')) {
                $table->string('color')->nullable();
            }
            if (!Schema::hasColumn('cars', 'fuel_type')) {
                $table->string('fuel_type')->default('Gasoline');
            }
            if (!Schema::hasColumn('cars', 'transmission')) {
                $table->string('transmission')->default('Automatic');
            }
            if (!Schema::hasColumn('cars', 'seats')) {
                $table->integer('seats')->default(5);
            }
            if (!Schema::hasColumn('cars', 'registration_expiry')) {
                $table->date('registration_expiry')->nullable();
            }
            if (!Schema::hasColumn('cars', 'insurance_expiry')) {
                $table->date('insurance_expiry')->nullable();
            }
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
