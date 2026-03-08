import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Car,
    Calendar,
    ChevronRight,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    CreditCard,
    MapPin,
    FileText,
    Banknote,
    Wallet,
    UserPlus
} from 'lucide-react';

import api from '../api';

export default function BookingForm({ showToast }) {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    const [formData, setFormData] = useState({
        car_id: '',
        customer_id: '',
        drive_type: 'Self-Drive',
        driver_id: '',
        start_date: '',
        end_date: '',
        pickup_location: 'Main Office Branch',
        return_location: 'Main Office Branch',
        payment_method: 'Card',
        payment_status: 'Paid',
        notes: '',
        status: 'Pending'
    });

    useEffect(() => {
        Promise.all([api.get('/cars'), api.get('/customers'), api.get('/drivers')])
            .then(([carsRes, custRes, driversRes]) => {
                setCars(carsRes.data.filter(c => c.status === 'Available'));
                setCustomers(custRes.data);
                setDrivers(driversRes.data.filter(d => d.status === 'Available'));
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/bookings', formData);
            navigate('/bookings');
        } catch (err) {
            console.error(err);
            showToast('Failed to create booking. Please check the inputs.', 'error');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-4 mb-8">
                <button
                    onClick={() => navigate('/bookings')}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Create Reservation</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-tighter opacity-70 italic-rows">Reservation Form</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Section 1: Entity Selection */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 italic-rows">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Client & Vehicle
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Customer Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-4 w-4 h-4 text-slate-400 dark:text-slate-500 z-10" />
                                        <input
                                            type="text"
                                            required={!formData.customer_id}
                                            placeholder="Search and register a client..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 font-bold"
                                            value={customerSearch}
                                            onChange={(e) => {
                                                setCustomerSearch(e.target.value);
                                                setShowCustomerDropdown(true);
                                                if (formData.customer_id) {
                                                    setFormData({ ...formData, customer_id: '' });
                                                }
                                            }}
                                            onFocus={() => setShowCustomerDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                                        />
                                        {showCustomerDropdown && (
                                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 ? (
                                                    <div className="p-3 text-sm text-slate-500 dark:text-slate-400">No customers found.</div>
                                                ) : (
                                                    <ul className="py-1">
                                                        {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(c => (
                                                            <li
                                                                key={c.id}
                                                                className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 cursor-pointer transition-colors"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, customer_id: c.id });
                                                                    setCustomerSearch(c.name);
                                                                    setShowCustomerDropdown(false);
                                                                }}
                                                            >
                                                                <div className="font-bold">{c.name}</div>
                                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest">{c.email}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Available Fleet</label>
                                    <div className="relative">
                                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        <select
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer dark:text-slate-200 font-bold"
                                            value={formData.car_id}
                                            onChange={e => setFormData({ ...formData, car_id: e.target.value })}
                                        >
                                            <option value="" className="dark:bg-slate-800">Select available vehicle</option>
                                            {cars.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-800">{c.make} {c.model} ({c.registration_number})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Drive Type</label>
                                        <select
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold dark:text-slate-200"
                                            value={formData.drive_type}
                                            onChange={e => {
                                                setFormData({
                                                    ...formData,
                                                    drive_type: e.target.value,
                                                    driver_id: e.target.value === 'Self-Drive' ? '' : formData.driver_id
                                                });
                                            }}
                                        >
                                            <option value="Self-Drive">Self-Drive</option>
                                            <option value="With Driver">With Driver</option>
                                        </select>
                                    </div>
                                    {formData.drive_type === 'With Driver' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Assign Driver</label>
                                            <select
                                                required
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold dark:text-slate-200"
                                                value={formData.driver_id}
                                                onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                                            >
                                                <option value="">Select available driver</option>
                                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 italic-rows">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Payment details
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Method</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold dark:text-slate-200"
                                        value={formData.payment_method}
                                        onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                    >
                                        <option value="Card">Card</option>
                                        <option value="Cash">Cash</option>
                                        <option value="GCash">GCash</option>
                                        <option value="Maya">Maya</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Status</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold dark:text-slate-200"
                                        value={formData.payment_status}
                                        onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Unpaid">Unpaid</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Scheduling & Locations */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 italic-rows">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center font-sans">
                                <Calendar className="w-4 h-4 mr-2" />
                                Rental Schedule
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Pickup Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 font-bold"
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Return Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 font-bold"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 italic-rows">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                Logistics
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Pickup Location</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 font-medium"
                                        placeholder="e.g. Airport, Main Office"
                                        value={formData.pickup_location}
                                        onChange={e => setFormData({ ...formData, pickup_location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Return Location</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 font-medium"
                                        placeholder="e.g. Airport, Main Office"
                                        value={formData.return_location}
                                        onChange={e => setFormData({ ...formData, return_location: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 italic-rows">
                    <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Internal Notes
                    </h3>
                    <textarea
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 min-h-[100px]"
                        placeholder="Add any specific requirements or notes here..."
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    ></textarea>
                </div>

                <div className="flex items-center justify-between p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex items-center text-indigo-700 dark:text-indigo-400">
                        <AlertCircle className="w-5 h-5 mr-3 opacity-60" />
                        <p className="text-sm font-medium">Please verify all reservation details before final confirmation.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/bookings')}
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Draft Only
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating...' : 'Confirm Reservation'}
                            {!submitting && <ChevronRight className="w-4 h-4 ml-2" />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
