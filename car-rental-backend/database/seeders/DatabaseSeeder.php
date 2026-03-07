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
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@carrentalpro.com')],
            [
                'name' => 'Admin User',
                'password' => bcrypt(env('ADMIN_PASSWORD', 'changeme')),
            ]
        );

        // Cars
        $car1 = \App\Models\Car::create([
            'make' => 'Toyota',
            'model' => 'Camry',
            'category' => 'Standard',
            'year' => 2022,
            'registration_number' => 'ABC-1234',
            'image_url' => 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=400',
            'status' => 'Rented',
            'color' => 'Silver',
            'fuel_type' => 'Gasoline',
            'transmission' => 'Automatic',
            'seats' => 5,
            'registration_expiry' => now()->addMonths(8),
            'insurance_expiry' => now()->addMonths(10),
        ]);
        $car2 = \App\Models\Car::create([
            'make' => 'Honda',
            'model' => 'CR-V',
            'category' => 'SUV',
            'year' => 2023,
            'registration_number' => 'XYZ-9876',
            'image_url' => 'https://images.unsplash.com/photo-1568844293986-ca9c3997271b?auto=format&fit=crop&q=80&w=400',
            'status' => 'Available',
            'color' => 'Modern Steel',
            'fuel_type' => 'Gasoline',
            'transmission' => 'CVT',
            'seats' => 5,
            'registration_expiry' => now()->addMonths(11),
            'insurance_expiry' => now()->addMonths(5),
        ]);
        $car3 = \App\Models\Car::create([
            'make' => 'Mercedes',
            'model' => 'S-Class',
            'category' => 'Premium',
            'year' => 2021,
            'registration_number' => 'LUX-7777',
            'image_url' => 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400',
            'status' => 'Rented',
            'color' => 'Obsidian Black',
            'fuel_type' => 'Hybrid',
            'transmission' => '9G-TRONIC',
            'seats' => 5,
            'registration_expiry' => now()->addMonths(2),
            'insurance_expiry' => now()->addMonths(3),
        ]);
        $car4 = \App\Models\Car::create([
            'make' => 'Toyota',
            'model' => 'Hiace',
            'category' => 'Van',
            'year' => 2020,
            'registration_number' => 'VAN-1111',
            'image_url' => 'https://images.unsplash.com/photo-1549416878-b9ca35c2d47b?auto=format&fit=crop&q=80&w=400',
            'status' => 'Maintenance',
            'color' => 'White',
            'fuel_type' => 'Diesel',
            'transmission' => 'Manual',
            'seats' => 12,
            'registration_expiry' => now()->subMonths(1),
            'insurance_expiry' => now()->addMonths(4),
        ]);

        // Maintenance Logs
        \App\Models\MaintenanceLog::create([
            'car_id' => $car4->id,
            'service_type' => 'Oil Change',
            'date' => now()->subDays(5),
            'cost' => 2500.00,
            'notes' => 'Regular PMS at 20k KM',
        ]);
        \App\Models\MaintenanceLog::create([
            'car_id' => $car4->id,
            'service_type' => 'Brake Check',
            'date' => now()->subDays(20),
            'cost' => 1200.00,
            'notes' => 'Brake pads still in good condition',
        ]);
        \App\Models\MaintenanceLog::create([
            'car_id' => $car1->id,
            'service_type' => 'Tire Rotation',
            'date' => now()->subMonths(3),
            'cost' => 800.00,
            'notes' => 'Rotated all 4 tires',
        ]);

        // Customers
        $cust1 = \App\Models\Customer::create(['name' => 'Alice Smith', 'email' => 'alice@example.com', 'phone' => '555-0101', 'license_number' => 'DL-AL-123', 'status' => 'Active']);
        $cust2 = \App\Models\Customer::create(['name' => 'Bob Johnson', 'email' => 'bob@example.com', 'phone' => '555-0202', 'license_number' => 'DL-BJ-456', 'status' => 'Active']);
        $cust3 = \App\Models\Customer::create(['name' => 'Charlie Brown', 'email' => 'charlie@example.com', 'phone' => '555-0303', 'license_number' => 'DL-CB-789', 'status' => 'Blacklisted']);
        $cust4 = \App\Models\Customer::create(['name' => 'Diana Prince', 'email' => 'diana@example.com', 'phone' => '555-0404', 'license_number' => 'DL-DP-000', 'status' => 'Inactive']);

        // Bookings
        \App\Models\Booking::create([
            'car_id' => $car3->id,
            'customer_id' => $cust1->id,
            'booking_reference' => 'BK-1001',
            'start_date' => now()->subDays(2),
            'end_date' => now()->addDays(3),
            'total_price' => 12500.00,
            'payment_method' => 'GCash',
            'payment_status' => 'Paid',
            'pickup_location' => 'Main Office',
            'return_location' => 'Main Office',
            'status' => 'Active'
        ]);
        \App\Models\Booking::create([
            'car_id' => $car1->id,
            'customer_id' => $cust2->id,
            'booking_reference' => 'BK-1002',
            'start_date' => now()->subDays(10),
            'end_date' => now()->subDays(5),
            'total_price' => 8500.00,
            'payment_method' => 'Card',
            'payment_status' => 'Paid',
            'pickup_location' => 'Airport Terminal 1',
            'return_location' => 'Main Office',
            'status' => 'Completed'
        ]);
        \App\Models\Booking::create([
            'car_id' => $car2->id,
            'customer_id' => $cust1->id,
            'booking_reference' => 'BK-1003',
            'start_date' => now()->subMonths(1),
            'end_date' => now()->subDays(25),
            'total_price' => 5000.00,
            'payment_method' => 'Cash',
            'payment_status' => 'Paid',
            'pickup_location' => 'Main Office',
            'return_location' => 'Main Office',
            'status' => 'Completed'
        ]);
        \App\Models\Booking::create([
            'car_id' => $car4->id,
            'customer_id' => $cust3->id,
            'booking_reference' => 'BK-1004',
            'start_date' => now()->subMonths(2),
            'end_date' => now()->subMonths(2)->addDays(5),
            'total_price' => 15000.00,
            'payment_method' => 'Bank Transfer',
            'payment_status' => 'Paid',
            'pickup_location' => 'Main Office',
            'return_location' => 'Main Office',
            'status' => 'Completed'
        ]);

        // Add an Overdue booking for testing
        \App\Models\Booking::create([
            'car_id' => $car1->id,
            'customer_id' => $cust4->id,
            'booking_reference' => 'BK-1005',
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(1),
            'total_price' => 4500.00,
            'payment_method' => 'Maya',
            'payment_status' => 'Partial',
            'pickup_location' => 'Main Office',
            'return_location' => 'Main Office',
            'status' => 'Active', // Should show as Overdue in UI
            'notes' => 'Customer promised to pay balance on return'
        ]);

        // Add an Upcoming booking
        \App\Models\Booking::create([
            'car_id' => $car2->id,
            'customer_id' => $cust2->id,
            'booking_reference' => 'BK-1006',
            'start_date' => now()->addDays(2),
            'end_date' => now()->addDays(5),
            'total_price' => 6000.00,
            'payment_method' => 'GCash',
            'payment_status' => 'Unpaid',
            'pickup_location' => 'Main Office',
            'return_location' => 'Main Office',
            'status' => 'Pending'
        ]);
    }
}
