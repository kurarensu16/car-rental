import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Car,
    Users,
    CalendarRange,
    TrendingUp,
    ArrowUpRight,
    Clock,
    Plus,
    UserPlus,
    CalendarPlus,
    AlertCircle,
    ChevronRight,
    Coins
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

import api from '../api';

export default function Dashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/dashboard/summary');
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!data) return null;

    const { stats, recent_bookings, returns_today, chart_data, fleet_status } = data;

    const statCards = [
        {
            name: 'Total Fleet',
            value: stats.cars,
            icon: Car,
            color: 'bg-indigo-50 text-indigo-600',
            trend: '+2 this month',
            chartColor: '#6366f1'
        },
        {
            name: 'Customers',
            value: stats.customers,
            icon: Users,
            color: 'bg-emerald-50 text-emerald-600',
            trend: '+12% growth',
            chartColor: '#10b981'
        },
        {
            name: 'Active Bookings',
            value: stats.bookings,
            icon: CalendarRange,
            color: 'bg-amber-50 text-amber-600',
            trend: '5 starting today',
            chartColor: '#f59e0b'
        },
        {
            name: 'Total Revenue',
            value: `₱${Number(stats.revenue).toLocaleString()}`,
            icon: Coins,
            color: 'bg-rose-50 text-rose-600',
            trend: '+18.5% boost',
            chartColor: '#f43f5e'
        },
    ];

    const quickActions = [
        { name: 'New Booking', icon: CalendarPlus, href: '/bookings/new', color: 'bg-indigo-600 hover:bg-indigo-700' },
        { name: 'Add Vehicle', icon: Plus, href: '/cars', color: 'bg-slate-800 hover:bg-slate-900' },
        { name: 'Add Customer', icon: UserPlus, href: '/customers', color: 'bg-emerald-600 hover:bg-emerald-700' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Operational summary for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
                </div>

                {/* Quick Actions Bar */}
                <div className="flex items-center space-x-3">
                    {quickActions.map((action) => (
                        <button
                            key={action.name}
                            onClick={() => navigate(action.href)}
                            className={`${action.color} text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center shadow-sm hover:shadow-md`}
                        >
                            <action.icon className="w-4 h-4 mr-2" />
                            {action.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <div key={card.name} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`${card.color} dark:bg-slate-900/50 p-3 rounded-lg`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.name}</span>
                        </div>
                        <div className="flex items-end justify-between relative z-10">
                            <div>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{card.value}</span>
                                <div className="flex items-center mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {card.trend}
                                </div>
                            </div>
                            <div className="h-12 w-20 opacity-40 group-hover:opacity-100 transition-opacity">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chart_data.slice(-4)}>
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke={card.chartColor}
                                            fill={card.chartColor}
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Revenue Performance</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Monthly breakdown of income and booking volume</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="flex items-center text-xs font-medium text-slate-500">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5"></div> Revenue
                                </span>
                                <span className="flex items-center text-xs font-medium text-slate-500">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-1.5"></div> Bookings
                                </span>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chart_data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={25} />
                                    <Bar dataKey="bookings_count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Bookings Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white">Recent Bookings</h3>
                            <button onClick={() => navigate('/bookings')} className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline flex items-center">
                                View Full Log <ArrowUpRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                        <div className="overflow-x-auto text-slate-900 dark:text-slate-100">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400  text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Vehicle</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {recent_bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-sm text-slate-900 dark:text-white">{booking.customer?.name}</div>
                                                <div className="text-xs text-slate-500">{booking.customer?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium">{booking.car?.make} {booking.car?.model}</div>
                                                <div className="text-[10px] text-slate-400">{booking.car?.registration_number}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    booking.status === 'Active' ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-right">
                                                ₱{Number(booking.total_price).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Returns Today Widget */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-rose-50/30 dark:bg-rose-900/10">
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-rose-500 mr-2" />
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Returns Today</h3>
                            </div>
                            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                                {returns_today.length} Due
                            </span>
                        </div>
                        <div className="p-4 space-y-3">
                            {returns_today.length > 0 ? (
                                returns_today.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-rose-200 transition-colors group">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {booking.customer?.name?.[0]}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">{booking.customer?.name}</div>
                                                <div className="text-[10px] text-slate-500">{booking.car?.make} {booking.car?.model}</div>
                                            </div>
                                        </div>
                                        <button className="text-slate-300 group-hover:text-rose-500 transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-400 flex flex-col items-center">
                                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-xs italic">No vehicles due back today.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fleet Utilization Heatmap/Summary */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" />
                            Fleet Status
                        </h3>
                        <div className="space-y-6">
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-100">
                                            Overall Utilization
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black inline-block text-indigo-600">
                                            {fleet_status.rented > 0 ? Math.round(((fleet_status.rented + fleet_status.maintenance) / stats.cars) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100 dark:bg-slate-700">
                                    <div style={{ width: `${(fleet_status.rented / stats.cars) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
                                    <div style={{ width: `${(fleet_status.maintenance / stats.cars) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-rose-500"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50">
                                    <div className="text-sm font-black text-emerald-600">{fleet_status.available}</div>
                                    <div className="text-[9px] text-emerald-500 font-bold uppercase">Ready</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50">
                                    <div className="text-sm font-black text-amber-600">{fleet_status.rented}</div>
                                    <div className="text-[9px] text-amber-500 font-bold uppercase">Rented</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/50">
                                    <div className="text-sm font-black text-rose-600">{fleet_status.maintenance}</div>
                                    <div className="text-[9px] text-rose-500 font-bold uppercase">Service</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
