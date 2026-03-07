import React from 'react';
import {
    X,
    AlertCircle,
    Calendar,
    Wrench,
    Check,
    ChevronRight,
    BellOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationPopover({
    notifications,
    onClose,
    onMarkAsRead,
    onNavigate
}) {
    const unreadCount = notifications.filter(n => !n.read_at).length;

    const getIcon = (type) => {
        switch (type) {
            case 'overdue': return <AlertCircle className="w-4 h-4 text-rose-500" />;
            case 'upcoming': return <Calendar className="w-4 h-4 text-indigo-500" />;
            case 'maintenance': return <Wrench className="w-4 h-4 text-amber-500" />;
            default: return <AlertCircle className="w-4 h-4 text-slate-500" />;
        }
    };

    const getBg = (type) => {
        switch (type) {
            case 'overdue': return 'bg-rose-50 dark:bg-rose-900/20';
            case 'upcoming': return 'bg-indigo-50 dark:bg-indigo-900/20';
            case 'maintenance': return 'bg-amber-50 dark:bg-amber-900/20';
            default: return 'bg-slate-50 dark:bg-slate-900/20';
        }
    };

    return (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{unreadCount} Unread alerts</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="bg-slate-100 dark:bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BellOff className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 font-bold">All caught up!</p>
                        <p className="text-[10px] text-slate-400 uppercase mt-1">No new notifications</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer relative group ${!notification.read_at ? 'bg-indigo-50/30 dark:bg-indigo-900/5' : ''}`}
                            onClick={() => {
                                onMarkAsRead(notification.id);
                                if (onNavigate) {
                                    const path = notification.type === 'maintenance' ? '/cars' : '/bookings';
                                    onNavigate(path);
                                }
                            }}
                        >
                            {!notification.read_at && (
                                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-full" />
                            )}

                            <div className="flex gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getBg(notification.type)}`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h4 className={`text-xs font-bold truncate ${!notification.read_at ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                        {notification.message}
                                    </p>

                                    <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center">
                                            Take Action <ChevronRight className="w-3 h-3 ml-1" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                    <button className="w-full py-2 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">
                        View all activity history
                    </button>
                </div>
            )}
        </div>
    );
}
