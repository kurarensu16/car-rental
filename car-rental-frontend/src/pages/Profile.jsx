import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    User,
    Mail,
    Shield,
    Settings,
    Key,
    Bell,
    LogOut,
    Camera,
    CheckCircle,
    ChevronRight,
    Smartphone,
    MapPin,
    Globe,
    AlertCircle
} from 'lucide-react';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export default function Profile({ user: initialUser, setUser: updateGlobalUser, showToast }) {
    const [formData, setFormData] = useState({
        name: initialUser?.name || '',
        email: initialUser?.email || '',
        phone: initialUser?.phone || '',
        location: initialUser?.location || '',
        timezone: initialUser?.timezone || 'Asia/Manila',
        password: '',
        password_confirmation: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialUser) {
            setFormData(prev => ({
                ...prev,
                name: initialUser.name || '',
                email: initialUser.email || '',
                phone: initialUser.phone || '',
                location: initialUser.location || '',
                timezone: initialUser.timezone || 'Asia/Manila'
            }));
        }
    }, [initialUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const res = await api.put('/auth/profile', {
                ...formData,
                id: initialUser?.id // Send ID as fallback if session is flaky
            });

            if (res.data.success) {
                updateGlobalUser({ user: res.data.user });
                showToast('Profile updated successfully!', 'success');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update profile';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-200 dark:shadow-none border-4 border-white dark:border-slate-900 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=4f46e5&color=fff&size=128`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-all group-hover:scale-110 active:scale-95">
                        <Camera className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-2 text-left">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formData.name}</h1>
                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-100 dark:border-indigo-800/50">
                            {initialUser?.role || 'Admin'}
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {formData.email}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <MapPin className="w-3.5 h-3.5" /> {formData.location || 'Location not set'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Globe className="w-3.5 h-3.5" /> {formData.timezone}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : 'Update Profile'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Left Column: Account Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> Account Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-bold opacity-60 cursor-not-allowed dark:text-white"
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">Phone Number</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        placeholder="+63 9xx xxx xxxx"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">Work Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        placeholder="Manila, Philippines"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Security Update</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">New Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider ml-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar settings */}
                <div className="space-y-6">
                    <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-lg shadow-xl space-y-6 border border-slate-800">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            System Preferences
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300">Desktop Notifications</span>
                                <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer p-1 transition-all">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300">Email Reports</span>
                                <div className="w-10 h-6 bg-slate-700 rounded-full relative cursor-pointer p-1 transition-all">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div className="text-left font-black">
                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account Active</div>
                                <div className="text-lg text-slate-900 dark:text-white leading-tight uppercase">Admin Access</div>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed text-left">
                            You are currently authorized on the PROFESSIONAL tier. You have full access to all fleet and customer management tools.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
