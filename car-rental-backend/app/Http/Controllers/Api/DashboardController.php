<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Car;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary()
    {
        $today = Carbon::today()->format('Y-m-d');

        // Basic Stats
        $carCount = Car::count();
        $customerCount = Customer::count();
        $bookingCount = Booking::count();
        $totalRevenue = Booking::where('status', 'Completed')->sum('total_price');

        // Recent Bookings (already exists in frontend, but could be unified)
        $recentBookings = Booking::with(['car', 'customer'])
            ->latest()
            ->take(5)
            ->get();

        // Upcoming Returns Today
        $returnsToday = Booking::with(['car', 'customer'])
            ->where('end_date', $today)
            ->where('status', '!=', 'Cancelled')
            ->get();

        // Chart Data: Revenue and Bookings over last 6 months
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth()->format('Y-m-d');
            $endOfMonth = $month->copy()->endOfMonth()->format('Y-m-d');

            $monthlyBookings = Booking::whereBetween('start_date', [$startOfMonth, $endOfMonth])
                ->where('status', '!=', 'Cancelled')
                ->get();

            $chartData[] = [
                'name' => $month->format('M'),
                'revenue' => $monthlyBookings->where('status', 'Completed')->sum('total_price'),
                'bookings_count' => $monthlyBookings->count(),
            ];
        }

        // Fleet Status for widget
        $fleetStatus = [
            'available' => Car::where('status', 'Available')->count(),
            'rented' => Car::where('status', 'Rented')->count(),
            'maintenance' => Car::where('status', 'Maintenance')->count(),
        ];

        return response()->json([
            'stats' => [
                'cars' => $carCount,
                'customers' => $customerCount,
                'bookings' => $bookingCount,
                'revenue' => $totalRevenue,
            ],
            'recent_bookings' => $recentBookings,
            'returns_today' => $returnsToday,
            'chart_data' => $chartData,
            'fleet_status' => $fleetStatus,
        ]);
    }
}
