import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, PieChart, Calendar, Settings, ChevronRight, Tags, Menu, X, User, ShieldCheck, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0a] relative overflow-hidden transition-colors duration-300">
      
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
          "fixed lg:sticky top-0 left-0 h-screen w-[280px] flex flex-col bg-white/95 dark:bg-[#111111]/95 backdrop-blur-[20px] border-r border-slate-200 dark:border-white/10 z-50 transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Branding */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <Wallet size={24} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white">Cawang</span>
          </div>
          {/* Close Menu Button (Mobile) */}
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
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
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-indigo-500 dark:hover:text-indigo-400'
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
          <div className="bg-indigo-50/80 dark:bg-indigo-900/20 rounded-2xl p-4 flex items-center gap-3 border border-indigo-100/50 dark:border-indigo-500/20">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full shrink-0 border-2 border-white dark:border-slate-800 shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-200 dark:bg-indigo-900/50 shrink-0 flex items-center justify-center">
                <User size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Cawang User</span>
            </div>
          </div>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
            }}
            className="w-full py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors text-center"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header Tool Bar */}
        <header className="h-[72px] lg:h-[80px] shrink-0 sticky top-0 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md z-10 px-4 lg:px-8 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            {/* Hamburger (Mobile) */}
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>Home</span>
              <ChevronRight size={16} />
              <span className="text-slate-800 dark:text-slate-200 font-bold">{getCurrentPageName()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={toggleTheme}
              className="w-[40px] h-[40px] lg:w-[42px] lg:h-[42px] bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:shadow-md transition-all"
              title="Toggle Dark Mode"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
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
