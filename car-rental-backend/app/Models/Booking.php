<?php

namespace App\Models;

use App\Models\Car;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'car_id',
        'customer_id',
        'booking_reference',
        'start_date',
        'end_date',
        'total_price',
        'payment_method',
        'payment_status',
        'pickup_location',
        'return_location',
        'notes',
        'status',
        'drive_type',
        'driver_id',
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
