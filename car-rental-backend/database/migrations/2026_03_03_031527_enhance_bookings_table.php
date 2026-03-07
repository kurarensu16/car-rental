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
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('booking_reference')->unique()->after('id');
            $table->string('payment_method')->default('Card')->after('total_price'); // Cash, Card, GCash, Maya, Bank Transfer
            $table->string('payment_status')->default('Paid')->after('payment_method'); // Paid, Partial, Unpaid
            $table->string('pickup_location')->nullable()->after('payment_status');
            $table->string('return_location')->nullable()->after('pickup_location');
            $table->text('notes')->nullable()->after('return_location');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'booking_reference',
                'payment_method',
                'payment_status',
                'pickup_location',
                'return_location',
                'notes'
            ]);
        });
    }
};
