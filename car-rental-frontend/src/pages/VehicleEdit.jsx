import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Car,
    Save,
    X,
    ChevronRight,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Calendar,
    Settings,
    Shield,
    Image as ImageIcon
} from 'lucide-react';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function VehicleEdit({ showToast }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
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
        const fetchVehicle = async () => {
            try {
                const res = await api.get(`/cars/${id}`);
                const data = res.data;
                // Format dates for input[type="date"]
                setFormData({
                    ...data,
                    registration_expiry: data.registration_expiry ? data.registration_expiry.split('T')[0] : '',
                    insurance_expiry: data.insurance_expiry ? data.insurance_expiry.split('T')[0] : '',
                });
                if (data.image_url) {
                    setImagePreview(data.image_url);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch vehicle", err);
                showToast('Failed to load vehicle details.', 'error');
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();
            // Append all fields from formData
            Object.keys(formData).forEach(key => {
                // Skip if value is null or undefined
                if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append the image file if selected
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            // Since Laravel's PUT doesn't always handle FormData correctly, 
            // we use POST with _method=PUT spoofing
            formDataToSend.append('_method', 'PUT');

            await api.post(`/cars/${id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Vehicle updated successfully!', 'success');
            setTimeout(() => navigate('/cars'), 1500);
        } catch (err) {
            console.error("Failed to update vehicle", err);
            showToast(err.response?.data?.message || 'Failed to update vehicle.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <span className="hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => navigate('/cars')}>Fleet</span>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-slate-900 dark:text-slate-200 font-medium">Edit Vehicle</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                        <div className="bg-indigo-600/10 p-2 rounded-lg mr-3">
                            <Car className="w-6 h-6 text-indigo-600" />
                        </div>
                        Edit {formData.make} {formData.model}
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/cars')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Fleet
                </button>
            </div>



            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Left Column: Basic Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                                <Settings className="w-4 h-4 mr-2" />
                                Vehicle Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Model Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-medium"
                                        placeholder="e.g. Camry, CR-V"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Make / Brand</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-medium"
                                        placeholder="e.g. Toyota, Honda"
                                        value={formData.make}
                                        onChange={e => setFormData({ ...formData, make: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Vehicle Category</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-medium"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Van">Van</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Year</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-medium"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Registration Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-bold tracking-wider"
                                        placeholder="ABC-1234"
                                        value={formData.registration_number}
                                        onChange={e => setFormData({ ...formData, registration_number: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Status</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-bold"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Available">Available</option>
                                        <option value="Rented" disabled>Rented (Auto-set via Booking)</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Media & Appearance
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Vehicle Photo</label>
                                    <div className="flex items-center gap-6">
                                        <div className="flex-shrink-0 w-32 h-32 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                                            {imagePreview ? (
                                                <img src={imagePreview} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-10 h-10 text-slate-300" />
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
                                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer transition-all shadow-md shadow-indigo-200 dark:shadow-none"
                                            />
                                            <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                                Upload a high-quality photo of the vehicle. <br />
                                                JPG, PNG or WEBP (Max 2MB).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Color</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-medium"
                                            value={formData.color}
                                            onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Seats</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-medium"
                                            value={formData.seats}
                                            onChange={e => setFormData({ ...formData, seats: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Specs & Compliance */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                                <Settings className="w-4 h-4 mr-2" />
                                Mechanical Specs
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Fuel Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-medium"
                                        value={formData.fuel_type}
                                        onChange={e => setFormData({ ...formData, fuel_type: e.target.value })}
                                    >
                                        <option value="Gasoline">Gasoline</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Transmission</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 font-medium"
                                        value={formData.transmission}
                                        onChange={e => setFormData({ ...formData, transmission: e.target.value })}
                                    >
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                        <option value="CVT">CVT</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center">
                                <Shield className="w-4 h-4 mr-2" />
                                Compliance
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Registration Expiry</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
                                            value={formData.registration_expiry}
                                            onChange={e => setFormData({ ...formData, registration_expiry: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mb-2">Insurance Expiry</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="date"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
                                            value={formData.insurance_expiry}
                                            onChange={e => setFormData({ ...formData, insurance_expiry: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => navigate('/cars')}
                        className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
