import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Calendar,
    Car,
    User,
    MoreVertical,
    ChevronRight,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    X,
    Printer,
    Download,
    CheckSquare,
    CreditCard,
    Wallet,
    Banknote,
    Smartphone,
    MapPin,
    UserCheck,
    FileText,
    Edit,
    Trash2,
    UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All'); // All, Active, Upcoming, Cancelled
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = () => {
        setLoading(true);
        api.get('/bookings')
            .then(res => {
                setBookings(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/bookings/${id}`, { status: newStatus });
            fetchBookings();
            if (selectedBooking) {
                const updated = await api.get(`/bookings/${id}`);
                setSelectedBooking(updated.data);
            }
            setActiveMenu(null);
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update booking status.");
        }
    };

    const isOverdue = (booking) => {
        if (booking.status !== 'Active') return false;
        return new Date(booking.end_date) < new Date();
    };

    const getStatusIcon = (status, booking = null) => {
        if (booking && isOverdue(booking)) return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />;

        switch (status) {
            case 'Completed': return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />;
            case 'Active': return <Clock className="w-3.5 h-3.5 mr-1.5" />;
            case 'Cancelled': return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />;
            case 'Pending': return <Clock className="w-3.5 h-3.5 mr-1.5 opacity-60" />;
            default: return <Clock className="w-3.5 h-3.5 mr-1.5" />;
        }
    };

    const getStatusStyle = (status, booking = null) => {
        if (booking && isOverdue(booking)) {
            return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/50 ring-1 ring-rose-500/20';
        }

        switch (status) {
            case 'Completed': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50';
            case 'Active': return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50';
            case 'Cancelled': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/50';
            case 'Pending': return 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
            default: return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800/50';
        }
    };

    const getPaymentIcon = (method) => {
        switch (method) {
            case 'Card': return <CreditCard className="w-3 h-3 mr-1" />;
            case 'GCash': return <Smartphone className="w-3 h-3 mr-1 text-blue-500" />;
            case 'Maya': return <Smartphone className="w-3 h-3 mr-1 text-slate-800" />;
            case 'Cash': return <Banknote className="w-3 h-3 mr-1" />;
            case 'Bank Transfer': return <Wallet className="w-3 h-3 mr-1" />;
            default: return <CreditCard className="w-3 h-3 mr-1" />;
        }
    };

    const filteredBookings = bookings.filter(booking => {
        // Tab Filtering
        const now = new Date();
        const next7Days = new Date();
        next7Days.setDate(now.getDate() + 7);

        if (activeTab === 'Active Now') {
            if (booking.status !== 'Active') return false;
        } else if (activeTab === 'Upcoming') {
            const startDate = new Date(booking.start_date);
            if (booking.status === 'Cancelled' || booking.status === 'Completed') return false;
            if (startDate < now || startDate > next7Days) return false;
        } else if (activeTab === 'Cancelled') {
            if (booking.status !== 'Cancelled') return false;
        }

        // Search Filtering
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const customerName = booking.customer?.name?.toLowerCase() || '';
            const carSpecs = `${booking.car?.make} ${booking.car?.model} ${booking.car?.registration_number}`.toLowerCase();
            const ref = booking.booking_reference?.toLowerCase() || '';
            return customerName.includes(term) || carSpecs.includes(term) || ref.includes(term);
        }

        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 text-left">
                <div className="text-left w-full">
                    <nav className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
                        <span>Bookings</span>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <span className="text-slate-600 dark:text-slate-400">History & Status</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reservation Management</h1>
                </div>
                <Link to="/bookings/new" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all flex items-center shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    New Booking
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-6 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            {['All Reservations', 'Active Now', 'Upcoming', 'Cancelled'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-sm transition-all whitespace-nowrap border-b-2 px-1 pb-2 ${activeTab === tab
                                        ? 'font-black text-indigo-600 dark:text-indigo-400 border-indigo-600'
                                        : 'font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-transparent'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search client, car, ID..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-slate-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <button className="flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shrink-0">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Client & Vehicle</th>
                                <th className="px-6 py-4">Rental Duration</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium font-sans italic opacity-70">
                                        Syncing reservations with server...
                                    </td>
                                </tr>
                            ) : filteredBookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    onClick={() => setSelectedBooking(booking)}
                                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/10 transition-all group cursor-pointer border-l-2 ${isOverdue(booking) ? 'border-l-rose-500 bg-rose-50/10' : 'border-l-transparent'
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1.5">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 rounded uppercase tracking-tighter">
                                                    {booking.booking_reference || `BK-${booking.id}`}
                                                </span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{booking.customer?.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                                                <Car className="w-3.5 h-3.5 opacity-70" />
                                                <span>{booking.car?.make} {booking.car?.model} <span className="text-slate-400 mx-1">•</span> {booking.car?.registration_number}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-xs text-slate-600 dark:text-slate-300 mb-1 font-sans">
                                            <Calendar className="w-3 h-3 mr-2 text-slate-400 dark:text-slate-500" />
                                            <span className="font-black">{new Date(booking.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            <div className="h-px w-2 bg-slate-300 dark:bg-slate-600 mx-2"></div>
                                            <span className="font-black">{new Date(booking.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest pl-5">
                                            {Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))} Days Rental
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight">₱{Number(booking.total_price).toLocaleString()}</div>
                                        <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${booking.payment_status === 'Paid'
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : booking.payment_status === 'Partial'
                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                                            }`}>
                                            {booking.payment_status === 'Paid' ? <CheckSquare className="w-2.5 h-2.5 mr-1" /> : <Clock className="w-2.5 h-2.5 mr-1" />}
                                            {booking.payment_status || 'Paid'} via {booking.payment_method || 'Card'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border inline-flex items-center ${getStatusStyle(booking.status, booking)}`}>
                                            {getStatusIcon(booking.status, booking)}
                                            {isOverdue(booking) ? 'Overdue' : booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === booking.id ? null : booking.id);
                                            }}
                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-md transition-all active:scale-95"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {activeMenu === booking.id && (
                                            <div className="absolute right-6 top-12 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <div className="py-1">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); setActiveMenu(null); }} className="flex items-center w-full px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors">
                                                        <FileText className="w-4 h-4 mr-3 opacity-60" /> View Details
                                                    </button>
                                                    {booking.status === 'Active' && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'Completed'); }} className="flex items-center w-full px-4 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                                                            <UserCheck className="w-4 h-4 mr-3 opacity-60" /> Mark Completed
                                                        </button>
                                                    )}
                                                    {booking.status === 'Pending' && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'Active'); }} className="flex items-center w-full px-4 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                                            <Calendar className="w-4 h-4 mr-3 opacity-60" /> Start Trip
                                                        </button>
                                                    )}
                                                    {(booking.status === 'Pending' || booking.status === 'Active') && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(booking.id, 'Cancelled'); }} className="flex items-center w-full px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                                            <X className="w-4 h-4 mr-3 opacity-60" /> Cancel Booking
                                                        </button>
                                                    )}
                                                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                                    <button className="flex items-center w-full px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                        <Printer className="w-4 h-4 mr-3 opacity-60" /> Print Receipt
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-medium animate-pulse">
                                        <div className="flex flex-col items-center">
                                            <Search className="w-10 h-10 mb-4 opacity-20" />
                                            <p className="italic">No bookings match your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Detail Panel (Slide-over) */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedBooking(null)}></div>
                    <div className="absolute inset-y-0 right-0 max-w-xl w-full flex">
                        <div className="relative w-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                            {/* Panel Header */}
                            <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                            {selectedBooking.booking_reference || `BK-${selectedBooking.id}`}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedBooking.status, selectedBooking)}`}>
                                            {isOverdue(selectedBooking) ? 'Overdue' : selectedBooking.status}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Reservation Details</h2>
                                </div>
                                <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8">
                                {/* Customer Snapshot */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                        <User className="w-3.5 h-3.5 mr-2" /> Client Information
                                    </h3>
                                    <div className="flex items-start space-x-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xl">
                                            {selectedBooking.customer?.name?.[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-black text-slate-900 dark:text-white">{selectedBooking.customer?.name}</div>
                                            <div className="text-xs text-slate-500 font-medium">{selectedBooking.customer?.email}</div>
                                            <div className="flex items-center mt-2 space-x-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                                <span>Lic: {selectedBooking.customer?.license_number}</span>
                                                <span>•</span>
                                                <span>{selectedBooking.customer?.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Details */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                        <Car className="w-3.5 h-3.5 mr-2" /> Vehicle Information
                                    </h3>
                                    <div className="flex items-center space-x-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="w-16 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                                            {selectedBooking.car?.image_url ? (
                                                <img src={selectedBooking.car.image_url} alt="Car" className="w-full h-full object-cover" />
                                            ) : (
                                                <Car className="w-6 h-6 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-black text-slate-900 dark:text-white">{selectedBooking.car?.make} {selectedBooking.car?.model}</div>
                                            <div className="text-xs text-slate-500 font-medium mb-2">{selectedBooking.car?.registration_number} <span className="text-indigo-500 ml-1">[{selectedBooking.car?.category || 'Standard'}]</span></div>
                                            <div className="flex items-center mt-2 space-x-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-2">
                                                <span className="flex items-center"><UserPlus className="w-3.5 h-3.5 mr-1" /> {selectedBooking.drive_type || 'Self-Drive'}</span>
                                                {selectedBooking.drive_type === 'With Driver' && selectedBooking.driver && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Driver: {selectedBooking.driver.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Trip & Schedule */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                        <MapPin className="w-3.5 h-3.5 mr-2" /> Trip Schedule
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Pickup</div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white">{new Date(selectedBooking.start_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                                            <div className="text-xs text-slate-500 mt-1">{selectedBooking.pickup_location || 'Main Office Branch'}</div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Return</div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white">{new Date(selectedBooking.end_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                                            <div className="text-xs text-slate-500 mt-1">{selectedBooking.return_location || 'Main Office Branch'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment breakdown */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                        <Banknote className="w-3.5 h-3.5 mr-2" /> Financial Summary
                                    </h3>
                                    <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xl italic-rows">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center px-2 py-1 bg-emerald-500 text-[10px] font-black rounded uppercase tracking-tighter">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> {selectedBooking.payment_status || 'Paid'}
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-slate-400 flex items-center">
                                                {getPaymentIcon(selectedBooking.payment_method)} {selectedBooking.payment_method || 'Card Payment'}
                                            </div>
                                        </div>
                                        <div className="space-y-2 border-t border-slate-800 pt-4">
                                            <div className="flex justify-between text-xs text-slate-400 font-bold">
                                                <span>Rental Duration</span>
                                                <span className="text-white">{Math.ceil((new Date(selectedBooking.end_date) - new Date(selectedBooking.start_date)) / (1000 * 60 * 60 * 24))} Days</span>
                                            </div>
                                            <div className="flex justify-between text-base font-black">
                                                <span className="text-slate-400">Total Price</span>
                                                <span className="text-indigo-400">₱{Number(selectedBooking.total_price).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Internal Notes */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                        <FileText className="w-3.5 h-3.5 mr-2" /> Internal Notes
                                    </h3>
                                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 min-h-[80px] text-sm text-slate-500 italic">
                                        {selectedBooking.notes || 'No internal notes specified for this reservation.'}
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-900/50">
                                <button
                                    onClick={() => handleUpdateStatus(selectedBooking.id, selectedBooking.status === 'Cancelled' ? 'Pending' : 'Cancelled')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-black transition-all flex items-center justify-center border shadow-sm active:scale-95 ${selectedBooking.status === 'Cancelled'
                                        ? 'border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-50'
                                        : 'border-rose-100 text-rose-600 bg-white hover:bg-rose-50'
                                        }`}
                                >
                                    {selectedBooking.status === 'Cancelled' ? <UserCheck className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
                                    {selectedBooking.status === 'Cancelled' ? 'Restore' : 'Cancel Trip'}
                                </button>

                                {selectedBooking.status === 'Active' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedBooking.id, 'Completed')}
                                        className="flex-1 py-3 bg-emerald-600 text-white rounded-lg text-sm font-black transition-all hover:bg-emerald-700 shadow-lg active:scale-95 flex items-center justify-center"
                                    >
                                        <CheckSquare className="w-4 h-4 mr-2" />
                                        Complete
                                    </button>
                                )}

                                {selectedBooking.status === 'Pending' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedBooking.id, 'Active')}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-lg text-sm font-black transition-all hover:bg-indigo-700 shadow-lg active:scale-95 flex items-center justify-center"
                                    >
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Start Trip
                                    </button>
                                )}

                                <button className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors border border-slate-200 dark:border-slate-700 active:scale-95">
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors border border-slate-200 dark:border-slate-700 active:scale-95">
                                    <Edit className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
