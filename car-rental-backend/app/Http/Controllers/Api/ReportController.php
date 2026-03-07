<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Car;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function revenue(Request $request)
    {
        $period = $request->query('period', 'monthly');

        $bookings = Booking::where('status', 'Completed')->get();

        $grouped = $bookings->groupBy(function ($item) use ($period) {
            $date = Carbon::parse($item->start_date);
            if ($period === 'daily') {
                return $date->format('Y-m-d');
            } elseif ($period === 'weekly') {
                return $date->startOfWeek()->format('Y-m-d');
            } else {
                return $date->format('Y-m');
            }
        });

        $result = [];
        foreach ($grouped as $key => $items) {
            $result[] = [
                'date' => $key,
                'revenue' => $items->sum('total_price'),
                'bookings_count' => $items->count(),
            ];
        }

        // Sort descending by date
        usort($result, function ($a, $b) {
            return strcmp($b['date'], $a['date']);
        });

        // Limit results to maintain a readable chart
        if ($period === 'daily') {
            $result = array_slice($result, 0, 30);
        } elseif ($period === 'weekly') {
            $result = array_slice($result, 0, 12);
        } else {
            $result = array_slice($result, 0, 12);
        }

        // Reverse to show chronological order (oldest to newest)
        return response()->json(array_reverse($result));
    }

    public function utilization()
    {
        $cars = Car::all();
        $bookings = Booking::where('status', 'Completed')->get();

        $carStats = [];
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        foreach ($cars as $car) {
            $carBookings = $bookings->where('car_id', $car->id);
            $totalRevenue = $carBookings->sum('total_price');

            // Calculate utilization over last 30 days
            $recentBookings = Booking::where('car_id', $car->id)
                ->where('status', 'Completed')
                ->where('start_date', '>=', $thirtyDaysAgo->toDateString())
                ->get();

            $daysRentedRecent = 0;
            foreach ($recentBookings as $booking) {
                $start = Carbon::parse($booking->start_date);
                if ($start->lt($thirtyDaysAgo))
                    $start = $thirtyDaysAgo;

                $end = Carbon::parse($booking->end_date);
                $daysRentedRecent += $start->diffInDays($end) + 1;
            }

            $utilizationRate = round(($daysRentedRecent / 30) * 100);

            $carStats[] = [
                'car_id' => $car->id,
                'make' => $car->make,
                'model' => $car->model,
                'registration_number' => $car->registration_number,
                'total_revenue' => (float) $totalRevenue,
                'days_rented' => $carBookings->sum(function ($b) {
                    return Carbon::parse($b->start_date)->diffInDays(Carbon::parse($b->end_date)) + 1;
                }),
                'bookings_count' => $carBookings->count(),
                'utilization_rate' => $utilizationRate > 100 ? 100 : $utilizationRate,
            ];
        }

        // Sort by revenue descending
        usort($carStats, function ($a, $b) {
            return $b['total_revenue'] <=> $a['total_revenue'];
        });

        return response()->json($carStats);
    }
}
