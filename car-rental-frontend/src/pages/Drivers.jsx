import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Mail,
    Phone,
    CreditCard,
    MoreVertical,
    ChevronRight,
    User as UserIcon,
    Filter,
    ArrowUpDown,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    UserCheck,
    UserX,
    Eye,
    Edit3,
    Trash2,
    X,
    Truck
} from 'lucide-react';

import api from '../api';

export default function Drivers({ user, showToast }) {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('name');
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [isPanelLoading, setIsPanelLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newDriver, setNewDriver] = useState({
        name: '',
        email: '',
        phone: '',
        license_number: '',
    });

    useEffect(() => {
        api.get('/drivers')
            .then(res => {
                setDrivers(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const fetchDriverDetails = async (id) => {
        setIsPanelLoading(true);
        try {
            const res = await api.get(`/drivers/${id}`);
            setSelectedDriver(res.data);
        } catch (err) {
            console.error('Failed to fetch driver details:', err);
            showToast('Failed to load driver profile.', 'error');
        } finally {
            setIsPanelLoading(false);
        }
    };

    const handleAction = async (action, driver) => {
        setActiveMenu(null);

        switch (action) {
            case 'view':
                fetchDriverDetails(driver.id);
                break;
            case 'edit':
                showToast(`Editing ${driver.name} is coming soon!`, 'info');
                break;
            case 'toggle_status': {
                let nextStatus = 'Available';
                if (driver.status === 'Available') nextStatus = 'On Trip';
                else if (driver.status === 'On Trip') nextStatus = 'Off Duty';

                if (confirm(`Change status of ${driver.name} to ${nextStatus}?`)) {
                    try {
                        const res = await api.put(`/drivers/${driver.id}`, { status: nextStatus });
                        setDrivers(prev => prev.map(d => d.id === driver.id ? res.data : d));
                        if (selectedDriver && selectedDriver.id === driver.id) setSelectedDriver(res.data);
                    } catch (err) {
                        console.error('Failed to update status:', err);
                        showToast('Failed to update driver status.', 'error');
                    }
                }
                break;
            }
            case 'delete':
                if (confirm(`Are you sure you want to delete ${driver.name}? This action cannot be undone.`)) {
                    try {
                        await api.delete(`/drivers/${driver.id}`);
                        setDrivers(prev => prev.filter(d => d.id !== driver.id));
                        if (selectedDriver && selectedDriver.id === driver.id) setSelectedDriver(null);
                    } catch (err) {
                        console.error('Failed to delete driver:', err);
                        showToast('Failed to delete driver.', 'error');
                    }
                }
                break;
        }
    };

    const handleAddDriver = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('/drivers', newDriver);
            setDrivers([res.data, ...drivers].sort((a, b) => a.name.localeCompare(b.name)));
            setIsAddModalOpen(false);
            setNewDriver({ name: '', email: '', phone: '', license_number: '' });
            showToast('Driver added successfully!', 'success');
        } catch (err) {
            console.error('Failed to add driver:', err);
            if (err.response?.data?.errors) {
                const errorMessages = Object.values(err.response.data.errors).flat().join('\n');
                alert(`Validation Error:\n${errorMessages}`);
            } else {
                showToast('Failed to add driver. Please check the inputs.', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredDrivers = drivers
        .filter(d => {
            const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'bookings') return (b.bookings_count || 0) - (a.bookings_count || 0);
            return 0;
        });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'On Trip': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
            case 'Off Duty': return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Available': return <CheckCircle2 className="w-3 h-3 mr-1.5" />;
            case 'On Trip': return <Clock className="w-3 h-3 mr-1.5" />;
            case 'Off Duty': return <UserX className="w-3 h-3 mr-1.5" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <nav className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
                        <span>Staff Directory</span>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <span className="text-slate-600 dark:text-slate-400">Drivers</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Professional Drivers</h1>
                </div>
                {user?.role !== 'Staff' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Driver
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search drivers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 dark:placeholder-slate-500"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                        <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
                            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 focus:outline-none appearance-none pr-4"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="On Trip">On Trip</option>
                                <option value="Off Duty">Off Duty</option>
                            </select>
                        </div>

                        <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-2" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 focus:outline-none appearance-none pr-4"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="bookings">Sort by Trips Copmpleted</option>
                            </select>
                        </div>

                        <div className="hidden sm:block h-8 w-px bg-slate-100 dark:bg-slate-700 mx-2"></div>

                        <span className="text-sm text-slate-400 font-medium whitespace-nowrap">
                            {filteredDrivers.length} drivers
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Driver Profile</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Trips</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Loading drivers...
                                    </td>
                                </tr>
                            ) : filteredDrivers.map((driver) => (
                                <tr
                                    key={driver.id}
                                    onClick={() => fetchDriverDetails(driver.id)}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/5 transition-all group cursor-pointer"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 mr-4">
                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=${document.documentElement.classList.contains('dark') ? '1e293b' : 'f1f5f9'}&color=${document.documentElement.classList.contains('dark') ? '94a3b8' : '475569'}`} alt="" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{driver.name}</div>
                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wide">{driver.license_number}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight inline-flex items-center border ${getStatusStyle(driver.status)}`}>
                                            {getStatusIcon(driver.status)}
                                            {driver.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center">
                                            {driver.bookings_count || 0} <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">Trips</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === driver.id ? null : driver.id);
                                            }}
                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-all"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {activeMenu === driver.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setActiveMenu(null)}
                                                ></div>
                                                <div className="absolute right-6 top-12 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => handleAction('view', driver)}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center"
                                                        >
                                                            <Eye className="w-4 h-4 mr-3 text-slate-400" />
                                                            View Profile
                                                        </button>
                                                        {user?.role !== 'Staff' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAction('edit', driver)}
                                                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center"
                                                                >
                                                                    <Edit3 className="w-4 h-4 mr-3 text-slate-400" />
                                                                    Edit Driver
                                                                </button>
                                                                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                                                <button
                                                                    onClick={() => handleAction('toggle_status', driver)}
                                                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center"
                                                                >
                                                                    <ArrowUpDown className="w-4 h-4 mr-3 text-slate-400" />
                                                                    Rotate Status
                                                                </button>
                                                                {user?.role === 'Admin' && (
                                                                    <button
                                                                        onClick={() => handleAction('delete', driver)}
                                                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/5 flex items-center"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-3" />
                                                                        Delete Driver
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredDrivers.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-sm">
                                        No drivers successfully matched your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Driver Detail Drawer */}
            {selectedDriver && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedDriver(null)} />

                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <div className="pointer-events-auto w-screen max-w-xl transform transition duration-500 ease-in-out">
                                <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800">
                                    {/* Header */}
                                    <div className="px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center">
                                                <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-sm border border-slate-200 dark:border-slate-700 mr-5">
                                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDriver.name)}&size=128&background=6366f1&color=fff`} className="rounded-xl w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{selectedDriver.name}</h2>
                                                    <div className="flex items-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(selectedDriver.status)}`}>
                                                            {selectedDriver.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedDriver(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 px-6 py-8 sm:px-8 space-y-10">

                                        {/* Contact Details */}
                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                                <span className="w-8 h-px bg-slate-100 dark:bg-slate-800 mr-3"></span>
                                                Driver Information
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mr-4">
                                                        <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Email Address</div>
                                                        <div className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">{selectedDriver.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mr-4">
                                                        <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Mobile Number</div>
                                                        <div className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">{selectedDriver.phone}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mr-4">
                                                        <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Driver's License</div>
                                                        <div className="text-sm font-mono font-black text-slate-700 dark:text-slate-200 tracking-tight uppercase">{selectedDriver.license_number}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Recent Trips */}
                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                                                <span className="w-8 h-px bg-slate-100 dark:bg-slate-800 mr-3"></span>
                                                Recent Trips
                                            </h3>
                                            <div className="space-y-3">
                                                {selectedDriver.bookings?.length > 0 ? selectedDriver.bookings.map((booking, idx) => (
                                                    <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-default group">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center mr-4 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400">
                                                                <Truck className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">
                                                                    {booking.customer?.name} - {booking.car?.make} {booking.car?.model}
                                                                </div>
                                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                    {booking.start_date} → {booking.end_date}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                                                booking.status === 'Active' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {booking.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                                        <div className="text-slate-400 font-bold text-sm">No trips recorded.</div>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Actions */}
                                    <div className="px-6 py-6 sm:px-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex gap-3 justify-end">
                                            <button onClick={() => setSelectedDriver(null)} className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Driver Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />

                        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                            <div className="bg-white dark:bg-slate-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 sm:mx-0 sm:h-10 sm:w-10">
                                        <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                        <h3 className="text-lg font-black leading-6 text-slate-900 dark:text-white mb-1">
                                            Register New Driver
                                        </h3>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            Enter the driver's personnel information.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleAddDriver}>
                                <div className="px-4 py-5 sm:p-6 space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                                Full Legal Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <UserIcon className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newDriver.name}
                                                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white transition-colors"
                                                    placeholder="e.g. Juan Dela Cruz"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Mail className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={newDriver.email}
                                                        onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                                                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white transition-colors"
                                                        placeholder="juan@example.com"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                                    Mobile Number
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Phone className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        required
                                                        value={newDriver.phone}
                                                        onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                                                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white transition-colors"
                                                        placeholder="0917-123-4567"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                                Driver's License No.
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <CreditCard className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newDriver.license_number}
                                                    onChange={(e) => setNewDriver({ ...newDriver, license_number: e.target.value })}
                                                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white transition-colors font-mono uppercase"
                                                    placeholder="N01-XX-XXXXXX"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex w-full justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving Driver...' : 'Add Driver'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        className="mt-3 inline-flex w-full justify-center rounded-lg bg-white dark:bg-slate-800 px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 sm:mt-0 sm:w-auto transition-all"
                                        onClick={() => setIsAddModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
