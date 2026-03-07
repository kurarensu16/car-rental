import React, { useState } from 'react';
import axios from 'axios';
import api from '../api';
import {
    CarFront,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('admin@carrentalpro.com');
    const [password, setPassword] = useState('password');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const res = await api.post('/login', {
                email,
                password
            });

            if (res.data.success) {
                setLoginSuccess(true);
                setTimeout(() => {
                    onLogin(res.data);
                }, 1000);
            } else {
                setError(res.data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'The provided credentials do not match our records.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            {/* Background Decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse h-delay-2000" />
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo & Branding */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none mb-4 rotate-3 hover:rotate-0 transition-transform duration-500 border-2 border-white dark:border-slate-800">
                        <CarFront className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        CarRental<span className="text-indigo-600">Pro</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
                        Admin Fleet Management Portal • Philippines
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-500">
                    <div className="mb-6 space-y-1">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">System Login</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Please enter your specialized credentials</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.15em] ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white outline-none"
                                    placeholder="Enter your email..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.15em]">Secure Password</label>
                                <button type="button" className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 tracking-wider">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white outline-none"
                                    placeholder="Enter your password..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-1">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor="remember" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Secure my session</label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || loginSuccess}
                            className={`w-full relative py-4 ${loginSuccess ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all transform active:scale-[0.98] shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center overflow-hidden group`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : loginSuccess ? (
                                <div className="flex items-center gap-2 animate-in slide-in-from-bottom-2">
                                    <CheckCircle2 className="w-5 h-5" /> Authorized
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>

                </div>

                {/* Footer Credits */}
                <p className="text-center mt-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                    © 2024 CarRental Pro Philippines • All Rights Reserved
                </p>
            </div>
        </div>
    );
}
