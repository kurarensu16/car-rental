<?php

use App\Models\Car;
use App\Models\Customer;
use App\Models\Booking;

// Create Cars
$car1 = Car::create(['make' => 'Toyota', 'model' => 'Camry', 'year' => 2022, 'registration_number' => 'ABC-1234', 'status' => 'Available']);
$car2 = Car::create(['make' => 'Honda', 'model' => 'Civic', 'year' => 2023, 'registration_number' => 'XYZ-9876', 'status' => 'Available']);
$car3 = Car::create(['make' => 'Ford', 'model' => 'Mustang', 'year' => 2021, 'registration_number' => 'MUS-5555', 'status' => 'Rented']);

// Create Customers
$cust1 = Customer::create(['name' => 'Alice Smith', 'email' => 'alice@example.com', 'phone' => '555-0101', 'license_number' => 'DL-AL-123']);
$cust2 = Customer::create(['name' => 'Bob Johnson', 'email' => 'bob@example.com', 'phone' => '555-0202', 'license_number' => 'DL-BJ-456']);

// Create Bookings
Booking::create(['car_id' => $car3->id, 'customer_id' => $cust1->id, 'start_date' => now()->subDays(2), 'end_date' => now()->addDays(3), 'total_price' => 250.00, 'status' => 'Active']);
Booking::create(['car_id' => $car1->id, 'customer_id' => $cust2->id, 'start_date' => now()->subDays(10), 'end_date' => now()->subDays(5), 'total_price' => 300.00, 'status' => 'Completed']);

echo "Database seeded successfully!\n";
