import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = 10;
        const step = (100 / (duration / interval));

        const timer = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - step));
        }, interval);

        const closeTimer = setTimeout(() => {
            onClose();
        }, duration);

        return () => {
            clearInterval(timer);
            clearTimeout(closeTimer);
        };
    }, [duration, onClose]);

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                    border: 'border-emerald-100 dark:border-emerald-500/20',
                    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
                    bar: 'bg-emerald-500'
                };
            case 'error':
                return {
                    bg: 'bg-rose-50 dark:bg-rose-500/10',
                    border: 'border-rose-100 dark:border-rose-500/20',
                    icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
                    bar: 'bg-rose-500'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
                    border: 'border-indigo-100 dark:border-indigo-500/20',
                    icon: <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
                    bar: 'bg-indigo-500'
                };
        }
    };

    const styles = getStyles();

    return (
        <div className={`fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-right-full duration-300 w-full max-w-sm`}>
            <div className={`${styles.bg} ${styles.border} border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md`}>
                <div className="p-4 flex items-center">
                    <div className="flex-shrink-0 mr-3">
                        {styles.icon}
                    </div>
                    <div className="flex-1 mr-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-white/5 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="h-1 w-full bg-slate-200/50 dark:bg-slate-700/30">
                    <div
                        className={`h-full ${styles.bar} transition-all duration-10 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
