import {
  LayoutDashboard,
  CarFront,
  Users,
  CalendarRange,
  PlusCircle,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  TrendingUp,
  ShieldCheck,
  Contact
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Cars from './pages/Cars';
import Customers from './pages/Customers';
import Drivers from './pages/Drivers';
import Bookings from './pages/Bookings';
import BookingForm from './pages/BookingForm';
import Reports from './pages/Reports';
import VehicleEdit from './pages/VehicleEdit';
import Profile from './pages/Profile';
import Staff from './pages/Staff';
import NotificationPopover from './components/NotificationPopover';
import Toast from './components/Toast';
import Login from './pages/Login';
import axios from 'axios';
import api from './api';


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const parsed = savedUser ? JSON.parse(savedUser) : null;
      if (parsed && !parsed.name) {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        return null; // Corrupted state from the boolean bug
      }
      return parsed;
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      return null;
    }
  });

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUser(data.user);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(data.user));
    showToast(`Welcome back, ${data.user.name}!`, 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error("Logout failed", err);
    }
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Fleet', href: '/cars', icon: CarFront },
      { name: 'Customers', href: '/customers', icon: Users },
      { name: 'Drivers', href: '/drivers', icon: Contact },
      { name: 'Bookings', href: '/bookings', icon: CalendarRange },
    ];

    if (user?.role === 'Admin' || user?.role === 'Manager') {
      baseNav.push({ name: 'Reports', href: '/reports', icon: TrendingUp });
    }

    if (user?.role === 'Admin') {
      baseNav.push({ name: 'Add Staff', href: '/staff', icon: ShieldCheck });
    }

    return baseNav;
  };

  const navigation = getNavigation();

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-zinc-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-all duration-300 transform border-r border-zinc-200 dark:border-slate-800
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shrink-0`}>
        <div className="flex flex-col h-full overflow-hidden text-left">
          <div className="flex items-center justify-between h-16 px-4 bg-zinc-200/50 dark:bg-slate-900/50 border-b border-zinc-200 dark:border-slate-800 shrink-0">
            <Link to="/" className={`flex items-center space-x-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-50 w-0' : 'opacity-100 scale-100'}`}>
              <div className="bg-indigo-600 p-1.5 rounded-md shrink-0">
                <CarFront className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight whitespace-nowrap text-slate-900 dark:text-white">CarRental<span className="text-indigo-600">Pro</span></span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                title={isCollapsed ? item.name : ''}
                className={({ isActive }) =>
                  `flex items-center py-3 rounded-lg transition-all duration-200 group relative
                    ${isCollapsed ? 'px-0 justify-center' : 'px-4'}
                    ${isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-zinc-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-all ${isCollapsed ? '' : 'mr-3'}`} />
                <span className={`font-medium text-sm transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  {item.name}
                </span>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-5 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-zinc-200 dark:border-slate-800 shrink-0">
            <button
              onClick={handleLogout}
              className={`flex items-center w-full py-3 text-sm font-medium text-slate-500 dark:text-slate-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all ${isCollapsed ? 'justify-center' : 'px-4'}`}
            >
              <LogOut className={`w-5 h-5 shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
              <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-slate-900 transition-colors">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors">
          <div className="flex items-center flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all mr-4"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>

            <div className="max-w-md w-full relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-200 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full transition-all ${showNotifications ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read_at) && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform"></span>
                )}
              </button>

              {showNotifications && (
                <NotificationPopover
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  onMarkAsRead={markAsRead}
                  onNavigate={(path) => {
                    navigate(path);
                    setShowNotifications(false);
                  }}
                />
              )}
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <Link to="/profile" className="flex items-center space-x-3 cursor-pointer group">
              <div className="text-right hidden sm:block font-medium">
                <div className="text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors uppercase font-black tracking-tight">{user?.name || 'Admin User'}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{user?.role || 'Administrator'}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden group-hover:ring-indigo-500 transition-all">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin User')}&background=${darkMode ? '312e81' : '6366f1'}&color=${darkMode ? '818cf8' : 'fff'}`} alt="Avatar" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 lg:p-8 transition-colors">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Routes>
              <Route path="/" element={<Dashboard user={user} showToast={showToast} />} />
              <Route path="/cars" element={<Cars user={user} showToast={showToast} />} />
              <Route path="/cars/edit/:id" element={<VehicleEdit user={user} showToast={showToast} />} />
              <Route path="/customers" element={<Customers user={user} showToast={showToast} />} />
              <Route path="/drivers" element={<Drivers user={user} showToast={showToast} />} />
              <Route path="/bookings" element={<Bookings user={user} showToast={showToast} />} />
              <Route path="/bookings/new" element={<BookingForm user={user} showToast={showToast} />} />
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <Route path="/reports" element={<Reports user={user} showToast={showToast} />} />
              )}
              <Route path="/profile" element={<Profile user={user} setUser={handleLogin} showToast={showToast} />} />
              {user?.role === 'Admin' && (
                <Route path="/staff" element={<Staff user={user} showToast={showToast} />} />
              )}
            </Routes>
          </div>
        </main>
      </div>
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
    </div >
  );
}

export default App;
