<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MaintenanceLog extends Model
{
    use HasFactory;
    protected $fillable = [
        'car_id',
        'service_type',
        'date',
        'cost',
        'notes',
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}
