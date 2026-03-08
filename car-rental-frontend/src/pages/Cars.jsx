import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Car as CarIcon,
    ChevronRight,
    Eye,
    Edit3,
    Wrench,
    History,
    Trash2,
    Fuel,
    Calendar,
    Settings,
    Users,
    X,
    Shield,
    FileText,
    TrendingUp,
    Clock,
    Image as ImageIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../api';

export default function Cars({ user, showToast }) {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedCar, setSelectedCar] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [carDetails, setCarDetails] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newCar, setNewCar] = useState({
        make: '',
        model: '',
        category: 'Standard',
        year: new Date().getFullYear(),
        registration_number: '',
        image_url: '',
        status: 'Available',
        color: '',
        fuel_type: 'Gasoline',
        transmission: 'Automatic',
        seats: 5,
        registration_expiry: '',
        insurance_expiry: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCars();

        // Close menu on click outside
        const handleClickOutside = () => setActiveMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchCars = () => {
        api.get('/cars')
            .then(res => {
                setCars(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchCarDetails = async (id) => {
        setDetailsLoading(true);
        setSelectedCar(id);
        try {
            const res = await api.get(`/cars/${id}`);
            setCarDetails(res.data);
        } catch (err) {
            console.error("Failed to fetch car details", err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetails = () => {
        setSelectedCar(null);
        setCarDetails(null);
    };

    const handleAction = async (action, car, e) => {
        e.stopPropagation();
        setActiveMenu(null);

        switch (action) {
            case 'maintenance':
                try {
                    const newStatus = car.status === 'Maintenance' ? 'Available' : 'Maintenance';
                    await api.put(`/cars/${car.id}`, { status: newStatus });
                    fetchCars();
                    showToast(`Car status updated to ${newStatus}.`, 'success');
                } catch (err) {
                    console.error("Failed to update status", err);
                    showToast('Failed to update car status.', 'error');
                }
                break;
            case 'delete':
                if (window.confirm(`Are you sure you want to delete the ${car.make} ${car.model}?`)) {
                    try {
                        await api.delete(`/cars/${car.id}`);
                        fetchCars();
                        showToast('Car deleted successfully.', 'success');
                    } catch (err) {
                        console.error("Failed to delete car", err);
                        showToast('Failed to delete car.', 'error');
                    }
                }
                break;
            case 'view':
            case 'history':
                fetchCarDetails(car.id);
                break;
            case 'edit':
                navigate(`/cars/edit/${car.id}`);
                break;
            default:
                break;
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(newCar).forEach(key => {
                if (newCar[key] !== null && newCar[key] !== undefined) {
                    formData.append(key, newCar[key]);
                }
            });
            if (imageFile) {
                formData.append('image', imageFile);
            }

            await api.post('/cars', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsAddModalOpen(false);
            setNewCar({
                make: '',
                model: '',
                category: 'Standard',
                year: new Date().getFullYear(),
                registration_number: '',
                image_url: '',
                status: 'Available',
                color: '',
                fuel_type: 'Gasoline',
                transmission: 'Automatic',
                seats: 5,
                registration_expiry: '',
                insurance_expiry: '',
            });
            setImageFile(null);
            setImagePreview(null);
            fetchCars();
            showToast('Vehicle added successfully!', 'success');
        } catch (err) {
            console.error("Failed to add vehicle", err);
            showToast('Failed to add vehicle. Please check the registration number (must be unique).', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCars = cars.filter(car =>
        `${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryStyle = (category) => {
        switch (category?.toLowerCase()) {
            case 'suv': return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50';
            case 'premium': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50';
            case 'van': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50';
            default: return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/50';
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50';
            case 'Rented': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50';
            case 'Maintenance': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50';
            default: return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800/50';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-500';
            case 'Rented': return 'bg-amber-500';
            case 'Maintenance': return 'bg-rose-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                    <nav className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
                        <span>Fleet</span>
                        <ChevronRight className="w-3 h-3 mx-2" />
                        <span className="text-slate-600 dark:text-slate-400">All Vehicles</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fleet Management</h1>
                </div>
                {user?.role !== 'Staff' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all flex items-center shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vehicle
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by make, model or registration..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 dark:placeholder-slate-500"
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </button>
                        <span className="text-sm text-slate-400 font-medium">
                            {filteredCars.length} vehicles total
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Vehicle Details</th>
                                <th className="px-6 py-4">Registration</th>
                                <th className="px-6 py-4">Year</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Loading fleet data...
                                    </td>
                                </tr>
                            ) : filteredCars.map((car) => (
                                <tr
                                    key={car.id}
                                    onClick={() => fetchCarDetails(car.id)}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/5 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-16 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mr-4">
                                                {car.image_url ? (
                                                    <img src={car.image_url} alt={car.make} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                        <CarIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white leading-tight">{car.make} {car.model}</div>
                                                <div className={`text-[10px] px-1.5 py-0.5 rounded border inline-block mt-1 uppercase tracking-widest font-black ${getCategoryStyle(car.category)}`}>
                                                    {car.category || 'Standard'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm uppercase bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                                            {car.registration_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {car.year}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-tight inline-flex items-center border ${getStatusStyle(car.status)}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusColor(car.status)}`}></div>
                                            {car.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMenu(activeMenu === car.id ? null : car.id);
                                            }}
                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-all"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {activeMenu === car.id && (
                                            <div className="absolute right-6 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                                                <button onClick={(e) => handleAction('view', car, e)} className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                    <Eye className="w-4 h-4 mr-3 text-slate-400" /> View Details
                                                </button>
                                                {user?.role !== 'Staff' && (
                                                    <button onClick={(e) => handleAction('edit', car, e)} className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                        <Edit3 className="w-4 h-4 mr-3 text-slate-400" /> Edit Vehicle
                                                    </button>
                                                )}
                                                {user?.role !== 'Staff' && (
                                                    <button onClick={(e) => handleAction('maintenance', car, e)} className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                        <Wrench className="w-4 h-4 mr-3 text-rose-500" />
                                                        {car.status === 'Maintenance' ? 'Mark as Available' : 'Mark as Maintenance'}
                                                    </button>
                                                )}
                                                <button onClick={(e) => handleAction('history', car, e)} className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                                    <History className="w-4 h-4 mr-3 text-slate-400" /> Booking History
                                                </button>
                                                {user?.role === 'Admin' && (
                                                    <>
                                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
                                                        <button onClick={(e) => handleAction('delete', car, e)} className="w-full flex items-center px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                                                            <Trash2 className="w-4 h-4 mr-3" /> Delete Vehicle
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredCars.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">
                                        No vehicles found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Showing page 1 of 1</span>
                    <div className="flex space-x-2">
                        <button disabled className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-300 dark:text-slate-600 pointer-events-none transition-colors">Previous</button>
                        <button disabled className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-300 dark:text-slate-600 pointer-events-none transition-colors">Next</button>
                    </div>
                </div>
            </div>
            {/* Add Vehicle Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />

                        <form onSubmit={handleAddVehicle} className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                            <div className="absolute right-6 top-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">Add New Vehicle</h3>
                                <p className="text-slate-500 font-bold text-sm">Fill in the details below to add a new car to your fleet.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                {/* Basic Info */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Make</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Toyota"
                                        value={newCar.make}
                                        onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Model</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Camry"
                                        value={newCar.model}
                                        onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Category</label>
                                    <select
                                        value={newCar.category}
                                        onChange={(e) => setNewCar({ ...newCar, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white appearance-none"
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Van">Van</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Year</label>
                                    <input
                                        required
                                        type="number"
                                        value={newCar.year}
                                        onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Registration #</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="ABC-1234"
                                        value={newCar.registration_number}
                                        onChange={(e) => setNewCar({ ...newCar, registration_number: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Status</label>
                                    <select
                                        value={newCar.status}
                                        onChange={(e) => setNewCar({ ...newCar, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white appearance-none"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Rented">Rented</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>

                                {/* Detailed Specs */}
                                <div className="sm:col-span-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-indigo-400 mb-4 ml-1">Detailed Specifications</h4>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Color</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Alpine White"
                                        value={newCar.color}
                                        onChange={(e) => setNewCar({ ...newCar, color: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Seats</label>
                                    <input
                                        type="number"
                                        value={newCar.seats}
                                        onChange={(e) => setNewCar({ ...newCar, seats: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Fuel Type</label>
                                    <select
                                        value={newCar.fuel_type}
                                        onChange={(e) => setNewCar({ ...newCar, fuel_type: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white appearance-none"
                                    >
                                        <option value="Gasoline">Gasoline</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Transmission</label>
                                    <select
                                        value={newCar.transmission}
                                        onChange={(e) => setNewCar({ ...newCar, transmission: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white appearance-none"
                                    >
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                        <option value="CVT">CVT</option>
                                    </select>
                                </div>

                                {/* Images & Expiry */}
                                <div className="sm:col-span-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-indigo-400 mb-4 ml-1">Documentation & Media</h4>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Vehicle Photo</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                                            {imagePreview ? (
                                                <img src={imagePreview} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setImageFile(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 cursor-pointer"
                                            />
                                            <p className="mt-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider italic">JPG, PNG or WEBP. Max 2MB recommended.</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Registration Expiry</label>
                                    <input
                                        type="date"
                                        value={newCar.registration_expiry}
                                        onChange={(e) => setNewCar({ ...newCar, registration_expiry: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Insurance Expiry</label>
                                    <input
                                        type="date"
                                        value={newCar.insurance_expiry}
                                        onChange={(e) => setNewCar({ ...newCar, insurance_expiry: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col sm:flex-row-reverse gap-3">
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isSubmitting ? 'Adding Vehicle...' : 'Save Vehicle'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-8 py-3 rounded-xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vehicle Detail Drawer */}
            {selectedCar && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeDetails} />

                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <div className="pointer-events-auto relative w-screen max-w-md animate-in slide-in-from-right duration-300">
                            <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Vehicle Details</h2>
                                        <button onClick={closeDetails} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {detailsLoading ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : carDetails && (
                                    <div className="flex-1 px-6 pb-6">
                                        {/* Header Info */}
                                        <div className="mb-8">
                                            <div className="rounded-2xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800 aspect-video bg-slate-100 dark:bg-slate-800">
                                                {carDetails.image_url ? (
                                                    <img src={carDetails.image_url} alt={carDetails.make} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <CarIcon className="w-12 h-12" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{carDetails.make} {carDetails.model}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight border ${getStatusStyle(carDetails.status)}`}>
                                                    {carDetails.status}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-bold text-sm tracking-tight">{carDetails.registration_number} • {carDetails.year}</p>
                                        </div>

                                        {/* Specs Grid */}
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center mb-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                    <Fuel className="w-3 h-3 mr-1.5" /> Fuel Type
                                                </div>
                                                <div className="font-bold text-slate-900 dark:text-white">{carDetails.fuel_type || 'Gasoline'}</div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center mb-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                    <Settings className="w-3 h-3 mr-1.5" /> Transmission
                                                </div>
                                                <div className="font-bold text-slate-900 dark:text-white">{carDetails.transmission || 'Automatic'}</div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center mb-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                    <Users className="w-3 h-3 mr-1.5" /> Capacity
                                                </div>
                                                <div className="font-bold text-slate-900 dark:text-white">{carDetails.seats || 5} Seats</div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex items-center mb-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                    <Shield className="w-3 h-3 mr-1.5" /> Color
                                                </div>
                                                <div className="font-bold text-slate-900 dark:text-white">{carDetails.color || 'Not specified'}</div>
                                            </div>
                                        </div>

                                        {/* Documents */}
                                        <div className="mb-8">
                                            <h4 className="flex items-center text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
                                                <FileText className="w-3 h-3 mr-2" /> Documents Expiry
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400">Registration</div>
                                                    <div className="text-sm font-black text-slate-900 dark:text-white">{carDetails.registration_expiry ? new Date(carDetails.registration_expiry).toLocaleDateString() : 'N/A'}</div>
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400">Insurance</div>
                                                    <div className="text-sm font-black text-slate-900 dark:text-white">{carDetails.insurance_expiry ? new Date(carDetails.insurance_expiry).toLocaleDateString() : 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* History Sections */}
                                        <div className="space-y-6">
                                            {carDetails.bookings && carDetails.bookings.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
                                                        <History className="w-3 h-3 mr-2" /> Recent Bookings
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {carDetails.bookings.slice(0, 3).map(booking => (
                                                            <div key={booking.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden relative border border-slate-100 dark:border-slate-700">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div className="font-black text-sm text-slate-900 dark:text-white">{booking.customer?.name}</div>
                                                                    <div className="text-[10px] font-black text-indigo-600">₱{Number(booking.total_price).toLocaleString()}</div>
                                                                </div>
                                                                <div className="text-xs text-slate-500 font-bold">{new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</div>
                                                                <div className="mt-1">
                                                                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${booking.status === 'Active' ? 'bg-amber-100 text-amber-700' :
                                                                        booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                            'bg-rose-100 text-rose-700'
                                                                        }`}>
                                                                        {booking.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {carDetails.maintenance_logs && carDetails.maintenance_logs.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
                                                        <Wrench className="w-3 h-3 mr-2" /> Service History
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {carDetails.maintenance_logs.map(log => (
                                                            <div key={log.id} className="p-3 rounded-xl border-l-4 border-rose-500 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div className="font-black text-sm text-slate-900 dark:text-white">{log.service_type}</div>
                                                                    <div className="text-[10px] text-slate-400 font-bold">{new Date(log.date).toLocaleDateString()}</div>
                                                                </div>
                                                                {log.notes && <div className="text-xs text-slate-500 italic mt-1">"{log.notes}"</div>}
                                                                {log.cost && <div className="text-[10px] font-black text-slate-400 mt-1">COST: ₱{Number(log.cost).toLocaleString()}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
