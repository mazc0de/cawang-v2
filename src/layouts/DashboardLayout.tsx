import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, PieChart, Calendar, Settings, ChevronRight, Tags, Menu, X, User, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../lib/supabase';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Transactions', path: '/app/transactions', icon: Receipt },
    { name: 'Safe-Pay', path: '/app/safe-pay', icon: ShieldCheck },
    { name: 'Accounts', path: '/app/accounts', icon: Wallet },
    { name: 'Categories', path: '/app/categories', icon: Tags },
    { name: 'Budgeting', path: '/app/budgeting', icon: PieChart },
    { name: 'Calendar', path: '/app/calendar', icon: Calendar },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  // Helper to format route name
  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path === '/app') return 'Overview';
    const segment = path.split('/').pop();
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Overview';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={clsx(
          "fixed lg:sticky top-0 left-0 h-screen w-[280px] flex flex-col bg-white/95 backdrop-blur-[20px] border-r border-white/50 z-50 transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Branding */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <Wallet size={24} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">Cawang</span>
          </div>
          {/* Close Menu Button (Mobile) */}
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/app'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-[14px] rounded-2xl transition-all duration-200',
                  isActive 
                    ? 'active-nav-link'
                    : 'text-slate-500 hover:bg-white/60 hover:text-indigo-500'
                )
              }
            >
              <item.icon size={20} />
              <span className="font-semibold">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Account profile card & Logout */}
        <div className="p-4 flex flex-col gap-2 shrink-0">
          <div className="bg-indigo-50/80 rounded-2xl p-4 flex items-center gap-3 border border-indigo-100/50">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full shrink-0 border-2 border-white shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-200 shrink-0 flex items-center justify-center">
                <User size={20} className="text-indigo-600" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 truncate">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
              <span className="text-xs font-medium text-slate-500 truncate">Cawang User</span>
            </div>
          </div>
          <button 
            onClick={async () => {
              const { supabase } = await import('../lib/supabase');
              await supabase.auth.signOut();
            }}
            className="w-full py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-center"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header Tool Bar */}
        <header className="h-[72px] lg:h-[80px] shrink-0 sticky top-0 bg-white/70 backdrop-blur-md z-10 px-4 lg:px-8 flex items-center justify-between border-b border-white/30">
          <div className="flex items-center gap-3">
            {/* Hamburger (Mobile) */}
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-white/80 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Home</span>
              <ChevronRight size={16} />
              <span className="text-slate-800 font-bold">{getCurrentPageName()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-4">
            {/* 
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 w-[200px] lg:w-[256px] rounded-xl bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm transition-all"
              />
            </div>
            <button className="sm:hidden w-[40px] h-[40px] bg-white/80 border border-white/50 rounded-xl flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
              <Search size={20} />
            </button>

            <button className="w-[40px] h-[40px] lg:w-[42px] lg:h-[42px] bg-white/80 border border-white/50 rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-500 hover:shadow-md transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            */}
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 w-full pb-24 lg:pb-8">
          <Outlet />
        </div>
      </main>
      
      {/* Floating AI Trigger Button 
      <button className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-12 h-12 lg:w-14 lg:h-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_20px_25px_-5px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 z-40 animate-bounce cursor-pointer group">
        <BrainCircuit size={20} className="text-white group-hover:animate-pulse lg:w-6 lg:h-6" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-50">
          1
        </span>
      </button>
      */}
    </div>
  );
}
