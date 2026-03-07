<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'license_number',
        'status',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
