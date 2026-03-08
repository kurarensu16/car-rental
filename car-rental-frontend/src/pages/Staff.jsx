import React, { useState } from 'react';
import {
    UserPlus,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

import api from '../api';

export default function CreateStaff({ showToast }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        location: '',
        role: 'Staff',
        timezone: 'Asia/Manila'
    });

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            location: '',
            role: 'Staff',
            timezone: 'Asia/Manila'
        });
        setError(null);
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await api.post('/users', formData);
            if (res.data.success) {
                showToast('Staff member added successfully!', 'success');
                resetForm();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add staff member';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="text-left mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                    <UserPlus className="w-8 h-8 text-indigo-600" /> Create Staff Account
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-1">
                    Add a new team member to the system
                </p>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 text-left">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">New Staff Details</h2>
                </div>

                <form onSubmit={handleAddStaff} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Full Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                placeholder="Enter full name..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Email</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Temporary Password</label>
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white focus:bg-white dark:focus:bg-slate-800"
                            >
                                <option value="Staff">Staff (Standard Access)</option>
                                <option value="Admin">Admin (Full Access)</option>
                                <option value="Manager">Manager</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                placeholder="+63 9xx xxx xxxx"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Work Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                placeholder="e.g. Manila, Philippines"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                            {isLoading ? 'Processing...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
