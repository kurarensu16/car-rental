import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
    Download,
    FileText,
    TrendingUp,
    Car,
    Calendar,
    Filter
} from 'lucide-react';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function Reports() {
    const [activeTab, setActiveTab] = useState('revenue'); // revenue, utilization
    const [period, setPeriod] = useState('monthly'); // daily, weekly, monthly

    const [revenueData, setRevenueData] = useState([]);
    const [utilizationData, setUtilizationData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'revenue') {
                    const res = await api.get(`/reports/revenue?period=${period}`);
                    setRevenueData(res.data);
                } else {
                    const res = await api.get('/reports/utilization');
                    setUtilizationData(res.data);
                }
            } catch (err) {
                console.error("Failed to load report data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [activeTab, period]);

    const exportToCSV = () => {
        let headers = [];
        let rows = [];

        if (activeTab === 'revenue') {
            headers = ['Date', 'Revenue (₱)', 'Bookings Count'];
            rows = revenueData.map(item => [item.date, item.revenue, item.bookings_count]);
        } else {
            headers = ['Car Make/Model', 'Registration', 'Total Revenue (₱)', 'Days Rented', 'Bookings', 'Utilization (%)'];
            rows = utilizationData.map(item => [
                `${item.make} ${item.model}`,
                item.registration_number,
                `₱${Number(item.total_revenue).toFixed(2)}`,
                item.days_rented,
                item.bookings_count,
                `${item.utilization_rate}%`
            ]);
        }

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.map(val => `"${val}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`CarRentalPro - ${activeTab === 'revenue' ? 'Revenue' : 'Fleet Utilization'} Report`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        if (activeTab === 'revenue') {
            doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, 14, 38);
        }

        const startY = activeTab === 'revenue' ? 45 : 38;

        if (activeTab === 'revenue') {
            doc.autoTable({
                startY,
                head: [['Date', 'Revenue', 'Bookings']],
                body: revenueData.map(item => [item.date, `PHP ${Number(item.revenue).toLocaleString()}`, item.bookings_count]),
                headStyles: { fillColor: [79, 70, 229] },
                alternateRowStyles: { fillColor: [249, 250, 251] },
            });
        } else {
            doc.autoTable({
                startY,
                head: [['Vehicle', 'Registration', 'Total Revenue', 'Days Rented', 'Bookings', 'Utilization']],
                body: utilizationData.map(item => [
                    `${item.make} ${item.model}`,
                    item.registration_number,
                    `PHP ${Number(item.total_revenue).toLocaleString()}`,
                    item.days_rented,
                    item.bookings_count,
                    `${item.utilization_rate}%`
                ]),
                headStyles: { fillColor: [79, 70, 229] },
                alternateRowStyles: { fillColor: [249, 250, 251] },
            });
        }

        doc.save(`${activeTab}_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Gain insights into your fleet performance and revenue.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={exportToCSV}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center shadow-sm"
                    >
                        <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                        CSV
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 inline-flex w-full sm:w-auto overflow-x-auto">
                <button
                    onClick={() => setActiveTab('revenue')}
                    className={`flex items-center justify-center px-6 py-2.5 rounded-md text-sm font-black transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === 'revenue'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Revenue Analytics
                </button>
                <button
                    onClick={() => setActiveTab('utilization')}
                    className={`flex items-center justify-center px-6 py-2.5 rounded-md text-sm font-black transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === 'utilization'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                >
                    <Car className="w-4 h-4 mr-2" />
                    Fleet Performance
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 min-h-[500px]">

                {/* Revenue Controls */}
                {activeTab === 'revenue' && (
                    <div className="flex justify-end mb-6">
                        <div className="inline-flex items-center bg-slate-100 dark:bg-slate-900/50 p-1 rounded-md border border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-500 dark:text-slate-400 px-3 font-medium flex items-center">
                                <Filter className="w-3 h-3 mr-1" />
                                Period
                            </span>
                            <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            {['daily', 'weekly', 'monthly'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-3 py-1 text-xs font-medium rounded transition-all capitalize ${period === p
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Generating reports...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'revenue' ? (
                            <div className="space-y-8">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="relative overflow-hidden group border border-slate-100 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-12 h-12 text-indigo-600" />
                                        </div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Period Revenue</div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                                            ₱{revenueData.reduce((sum, item) => sum + Number(item.revenue), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="relative overflow-hidden group border border-slate-100 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <Calendar className="w-12 h-12 text-emerald-600" />
                                        </div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Period Bookings</div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                                            {revenueData.reduce((sum, item) => sum + Number(item.bookings_count), 0)}
                                        </div>
                                    </div>
                                    <div className="relative overflow-hidden group border border-slate-100 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-12 h-12 text-amber-600" />
                                        </div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Ticket Size</div>
                                        <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                                            ₱{(() => {
                                                const totalRev = revenueData.reduce((sum, item) => sum + Number(item.revenue), 0);
                                                const totalBks = revenueData.reduce((sum, item) => sum + Number(item.bookings_count), 0);
                                                return totalBks > 0 ? (totalRev / totalBks).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Chart */}
                                {revenueData.length > 0 ? (
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={revenueData}
                                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    tickFormatter={(value) => `₱${value}`}
                                                    dx={-10}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                                    formatter={(value) => [`₱${value}`, 'Revenue']}
                                                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                                <Area type="monotone" dataKey="bookings_count" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                        <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-center">No revenue data available for this period.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">Vehicle Performance</h3>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Ranked by highest earning</span>
                                </div>

                                {utilizationData.length > 0 ? (
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Vehicle</th>
                                                    <th className="px-6 py-4 text-right">Revenue Earned</th>
                                                    <th className="px-6 py-4 text-right">Days Rented</th>
                                                    <th className="px-6 py-4 text-center">Utilization</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {utilizationData.map((car, index) => (
                                                    <tr key={car.car_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 w-8 flex justify-center">
                                                                    <span className={`text-sm font-bold ${index < 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                                        #{index + 1}
                                                                    </span>
                                                                </div>
                                                                <div className="ml-2">
                                                                    <div className="font-medium text-slate-900 dark:text-white">{car.make} {car.model}</div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{car.registration_number}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white text-right">
                                                            ₱{Number(car.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 text-right">
                                                            {car.days_rented} days
                                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{car.bookings_count} bookings</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-end">
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
                                                                    {car.utilization_rate}%
                                                                </span>
                                                                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${car.utilization_rate > 50 ? 'bg-emerald-500' :
                                                                            car.utilization_rate > 25 ? 'bg-amber-500' :
                                                                                'bg-slate-400'
                                                                            }`}
                                                                        style={{ width: `${Math.min(car.utilization_rate, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                        <Car className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-center">No utilization data available.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
