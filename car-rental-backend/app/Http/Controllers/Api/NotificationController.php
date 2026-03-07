<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Notification;
use App\Models\Booking;
use App\Models\Car;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index()
    {
        try {
            $this->scan();
            return Notification::whereNull('read_at')
                ->orWhere('created_at', '>=', now()->subDays(3))
                ->orderBy('read_at', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();
        } catch (\Exception $e) {
            return response()->json([]);
        }
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['read_at' => now()]);
        return response()->json(['success' => true]);
    }

    /**
     * Scan for new alerts and create notifications if they don't exist.
     */
    public function scan()
    {
        $now = now();
        $tomorrow = now()->addDay();
        $nextWeek = now()->addDays(7);

        // 1. Check for OVERDUE returns
        $overdueBookings = Booking::with('customer', 'car')
            ->where('status', 'Active')
            ->where('end_date', '<', $now)
            ->get();

        foreach ($overdueBookings as $booking) {
            $this->createNotificationIfNotExists(
                'overdue',
                'Overdue Return: ' . ($booking->car->make ?? 'Car') . ' ' . ($booking->car->model ?? ''),
                'Vehicle ' . $booking->car->registration_number . ' was due on ' . Carbon::parse($booking->end_date)->format('M d, g:i A') . ' (Client: ' . ($booking->customer->name ?? 'Unknown') . ').',
                $booking->id
            );
        }

        // 2. Check for UPCOMING bookings (starting in < 24h)
        $upcomingBookings = Booking::with('customer', 'car')
            ->where('status', 'Pending') // Assuming Pending is for future
            ->where('start_date', '>', $now)
            ->where('start_date', '<=', $tomorrow)
            ->get();

        foreach ($upcomingBookings as $booking) {
            $this->createNotificationIfNotExists(
                'upcoming',
                'Upcoming Booking: ' . ($booking->car->make ?? 'Car') . ' ' . ($booking->car->model ?? ''),
                'Booking starting on ' . Carbon::parse($booking->start_date)->format('M d, g:i A') . ' for ' . ($booking->customer->name ?? 'Unknown') . '.',
                $booking->id
            );
        }

        // 3. Check for MAINTENANCE due
        $maintenanceCars = Car::where(function ($query) use ($nextWeek) {
            $query->whereBetween('registration_expiry', [now(), $nextWeek])
                ->orWhereBetween('insurance_expiry', [now(), $nextWeek]);
        })->get();

        foreach ($maintenanceCars as $car) {
            $expiryType = Carbon::parse($car->registration_expiry)->isBefore($nextWeek) ? 'Registration' : 'Insurance';
            $expiryDate = $expiryType === 'Registration' ? $car->registration_expiry : $car->insurance_expiry;

            $this->createNotificationIfNotExists(
                'maintenance',
                'Maintenance Alert: ' . $car->make . ' ' . $car->model,
                $expiryType . ' for vehicle ' . $car->registration_number . ' expires on ' . Carbon::parse($expiryDate)->format('M d, Y') . '.',
                $car->id
            );
        }
    }

    private function createNotificationIfNotExists($type, $title, $message, $relatedId)
    {
        $exists = Notification::where('type', $type)
            ->where('related_id', $relatedId)
            ->where(function ($q) {
                $q->whereNull('read_at')
                    ->orWhere('created_at', '>=', now()->subDays(1));
            })
            ->exists();

        if (!$exists) {
            Notification::create([
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'related_id' => $relatedId
            ]);
        }
    }
}
