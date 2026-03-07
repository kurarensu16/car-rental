<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    protected $fillable = [
        'make',
        'model',
        'category',
        'year',
        'registration_number',
        'image_url',
        'status',
        'color',
        'fuel_type',
        'transmission',
        'seats',
        'registration_expiry',
        'insurance_expiry',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function maintenanceLogs()
    {
        return $this->hasMany(MaintenanceLog::class);
    }
    //
}
