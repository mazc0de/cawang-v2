import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, PieChart, Calendar, Settings, Bell, Search, ChevronRight, BrainCircuit, Tags } from 'lucide-react';
import clsx from 'clsx';

export default function DashboardLayout() {
  const navItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { name: 'Transactions', path: '/app/transactions', icon: Receipt },
    { name: 'Accounts', path: '/app/accounts', icon: Wallet },
    { name: 'Categories', path: '/app/categories', icon: Tags },
    { name: 'Budgeting', path: '/app/budgeting', icon: PieChart },
    { name: 'Calendar', path: '/app/calendar', icon: Calendar },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sticky Sidebar */}
      <aside className="w-[280px] h-screen sticky top-0 flex flex-col bg-white/90 backdrop-blur-[20px] border-r border-white/50 z-20">
        {/* Branding */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Wallet size={24} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">Cawang</span>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/app'}
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
        <div className="p-4 flex flex-col gap-2">
          <div className="bg-indigo-50/80 rounded-2xl p-4 flex items-center gap-3 border border-indigo-100/50">
            <div className="w-10 h-10 rounded-full bg-indigo-200 shrink-0"></div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">User</span>
              <span className="text-xs font-medium text-slate-500">Free Plan</span>
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
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Tool Bar */}
        <header className="h-[80px] sticky top-0 bg-white/40 backdrop-blur-md z-10 px-8 flex items-center justify-between border-b border-white/30">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Home</span>
            <ChevronRight size={16} />
            <span className="text-slate-800 font-bold">Overview</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 min-w-[256px] rounded-xl bg-white/60 border border-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm"
              />
            </div>
            <button className="w-[42px] h-[42px] bg-white/80 border border-white/50 rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-500 hover:shadow-md transition-all">
              <Bell size={20} />
            </button>
            <button className="w-[42px] h-[42px] bg-white/80 border border-white/50 rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-500 hover:shadow-md transition-all">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Floating AI Trigger Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_20px_25px_-5px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 z-50 animate-bounce cursor-pointer group">
        <BrainCircuit size={24} className="text-white group-hover:animate-pulse" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-50">
          1
        </span>
      </button>
    </div>
  );
}
