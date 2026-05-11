
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_PLANTS } from './constants';
import { Plant, CartItem, UserRole, User, LandscapeItem, DashboardStats } from './types';
import { IoTDashboard } from './components/IoTDashboard';
import { DiseaseScanner } from './components/DiseaseScanner';
import { LiveHealthMonitor } from './components/LiveHealthMonitor';
import { AdminPanel } from './components/AdminPanel';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { 
  LayoutDashboard, 
  Activity, 
  Stethoscope, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  User as UserIcon,
  Menu,
  X,
  Leaf,
  Video,
  RefreshCw
} from 'lucide-react';

type Tab = 'dashboard' | 'monitor' | 'doctor' | 'auth' | 'admin' | 'live';

const STORAGE_KEY = 'floravision_plants_v3';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('monitor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [plants, setPlants] = useState<Plant[]>(() => {
    if (typeof window === 'undefined') return MOCK_PLANTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Local storage access failed.");
    }
    return MOCK_PLANTS;
  });

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
  }, [plants]);

  const stats = useMemo<DashboardStats>(() => ({
    totalPlants: plants.length,
    monitoredPlants: plants.filter(p => p.healthScore > 0).length,
    averageHealthScore: Math.round(plants.reduce((acc, p) => acc + p.healthScore, 0) / plants.length),
    activeAlerts: plants.filter(p => p.status !== 'Healthy').length
  }), [plants]);

  const isManagementUser = useMemo(() => 
    user && (user.role === UserRole.BUSINESS_ADMIN || user.role === UserRole.SUPER_ADMIN || user.role === UserRole.STAFF),
    [user]
  );

  const handleUpdatePlants = useCallback((updater: (prev: Plant[]) => Plant[]) => {
    setPlants(prev => updater(prev));
  }, []);

  const menuItems = [
    { id: 'monitor', icon: <Activity size={20} />, label: 'IoT Dashboard' },
    { id: 'live', icon: <Video size={20} />, label: 'Live Health Monitor' },
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Analytics' },
    { id: 'doctor', icon: <Stethoscope size={20} />, label: 'Plant Doctor' },
  ];

  if (isManagementUser) {
    menuItems.push({ id: 'admin', icon: <Settings size={20} />, label: 'Admin Console' });
  }

  return (
    <div className="min-h-screen bg-[#fdfcf0] flex selection:bg-primary selection:text-white">
      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[85vw] sm:w-72 lg:w-80 bg-surface text-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 border-r border-white/5 shadow-[20px_0_60px_-15px_rgba(6,78,59,0.2)]`}>
        <div className="h-full flex flex-col p-8 lg:p-10">
          <div className="flex items-center justify-between mb-12 lg:mb-16 px-2 group cursor-pointer">
            <div className="flex items-center gap-4 lg:gap-5">
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary rounded-[1.25rem] lg:rounded-[1.5rem] flex items-center justify-center shadow-[0_15px_30px_-5px_rgba(5,150,105,0.5)] rotate-6 group-hover:rotate-0 transition-all duration-700">
                <Leaf className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tighter leading-none font-display uppercase">FLORA<span className="text-accent italic">VISION</span></h1>
                <p className="text-[9px] lg:text-[10px] font-black text-accent/40 uppercase tracking-[0.4em] mt-2">Neural IoT Engine</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-3 lg:space-y-4">
            <p className="text-[9px] lg:text-[10px] font-black text-accent/20 uppercase tracking-[0.3em] mb-4 lg:mb-6 px-6">Main Command</p>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`sidebar-item w-full group py-4 lg:py-5 ${activeTab === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
              >
                <div className={`${activeTab === item.id ? 'text-white' : 'text-accent/40 group-hover:text-accent'} transition-colors duration-500`}>
                  {item.icon}
                </div>
                <span className="text-xs lg:text-sm font-black tracking-tight uppercase">{item.label}</span>
                {activeTab === item.id && (
                  <div className="absolute right-6 w-2 h-2 rounded-full bg-white shadow-[0_0_15px_#fff] animate-pulse" />
                )}
              </button>
            ))}
          </nav>

          <div className="pt-8 lg:pt-10 border-t border-white/5 space-y-3 lg:space-y-4">
            <p className="text-[9px] lg:text-[10px] font-black text-accent/20 uppercase tracking-[0.3em] mb-4 lg:mb-6 px-6">Account</p>
            {user ? (
              <button onClick={() => setUser(null)} className="sidebar-item w-full text-accent/40 hover:text-danger hover:bg-danger/10 group py-4 lg:py-5">
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs lg:text-sm font-black tracking-tight uppercase">Logout System</span>
              </button>
            ) : (
              <button onClick={() => setActiveTab('auth')} className="sidebar-item w-full text-accent/40 hover:text-primary hover:bg-primary/10 group py-4 lg:py-5">
                <UserIcon size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs lg:text-sm font-black tracking-tight uppercase">Access Portal</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-18 lg:h-24 bg-white/80 backdrop-blur-xl border-b border-stone-200/50 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 lg:p-3 bg-stone-100 text-stone-600 rounded-xl lg:rounded-2xl hover:bg-stone-200 transition-all">
              <Menu size={20} className="lg:hidden" />
              <Menu size={22} className="hidden lg:block" />
            </button>
            <div className="relative group hidden lg:block">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search nodes, sensors, diagnostics..." 
                className="w-80 xl:w-96 pl-14 pr-6 py-3 bg-stone-100/50 rounded-2xl border border-transparent focus:border-stone-200 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none text-sm font-bold transition-all placeholder:text-stone-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-8">
            <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-stone-100 text-stone-700 rounded-full border border-stone-200 shadow-inner">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_10px_rgba(45,90,39,0.5)]"></span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Neural Link Active</span>
            </div>
            
            <button className="relative p-2.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl lg:rounded-2xl transition-all group">
              <Bell size={20} />
              {stats.activeAlerts > 0 && (
                <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-danger text-white text-[7px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce">
                  {stats.activeAlerts}
                </span>
              )}
            </button>

            <div className="h-8 w-[1px] bg-stone-200/50 hidden sm:block" />

            {/* Global Control Button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('iot-system-reset'))}
                title="System Reset"
                className="whitespace-nowrap px-3 py-2 lg:px-4 bg-ink text-paper rounded-xl text-[9px] lg:text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-primary transition-all active:scale-95 flex items-center gap-1.5 lg:gap-2"
              >
                <RefreshCw size={12} className="lg:w-3.5 lg:h-3.5" /> <span className="hidden sm:inline">System_Reset</span>
                <span className="sm:hidden">Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-3 lg:gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs lg:text-sm font-black text-ink leading-none group-hover:text-primary transition-colors">{user?.email?.split('@')[0] || 'Guest'}</p>
                <p className="text-[8px] lg:text-[9px] font-black text-stone-400 uppercase tracking-widest mt-1.5">{user?.role || 'Visitor Mode'}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-stone-100 rounded-xl lg:rounded-2xl flex items-center justify-center text-stone-600 font-black border border-stone-200 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all overflow-hidden">
                {user?.email ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white text-base lg:text-lg">
                    {user.email[0].toUpperCase()}
                  </div>
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'monitor' && <IoTDashboard />}
            {activeTab === 'live' && <LiveHealthMonitor />}
            {activeTab === 'dashboard' && <Dashboard plants={plants} stats={stats} />}
            {activeTab === 'doctor' && <DiseaseScanner />}
            {activeTab === 'auth' && <Auth onLogin={setUser} isAdminMode={false} />}
            {activeTab === 'admin' && isManagementUser && (
              <AdminPanel 
                plants={plants} 
                userRole={user!.role}
                onAdd={(p) => handleUpdatePlants(prev => [...prev, p])} 
                onRemove={(id) => handleUpdatePlants(prev => prev.filter(p => p.id !== id))} 
                onUpdateStock={(id, stock) => handleUpdatePlants(prev => prev.map(p => p.id === id ? {...p, stock} : p))}
                onUpdatePlant={(id, updatedData) => handleUpdatePlants(prev => prev.map(p => p.id === id ? {...p, ...updatedData} : p))}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
