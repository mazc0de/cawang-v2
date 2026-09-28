import { useState, useEffect } from 'react';
import { ArrowRight, Wallet, PieChart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Landing() {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <Wallet size={24} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800">Cawang</span>
          </div>
          <div className="flex items-center gap-4">
            {!hasSession && (
              <button 
                onClick={() => navigate('/auth')}
                className="text-slate-600 font-bold hover:text-indigo-600 transition-colors"
              >
                Sign In
              </button>
            )}
            <button 
              onClick={() => navigate(hasSession ? '/app' : '/auth')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              {hasSession ? 'Go to Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-16 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px] -z-10"></div>
        
        <div className="max-w-4xl text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Introducing Salary Cycle Tracking
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-800 tracking-tight leading-tight mb-6">
            Track your money the way you <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">actually earn it.</span>
          </h1>
          
          <p className="text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed">
            Calendar months don't make sense if you get paid on the 25th. Cawang tracks your budgets and cashflow based on your real Salary Cycle.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => navigate(hasSession ? '/app' : '/auth')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95 group"
            >
              {hasSession ? 'Open Dashboard' : 'Get Started Now'}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mt-24">
          <FeatureCard 
            icon={RefreshCw}
            title="Custom Salary Cycle"
            desc="Set your payday and watch your entire dashboard adjust. Budgets and analytics reset only when you get paid."
            color="indigo"
          />
          <FeatureCard 
            icon={PieChart}
            title="Strict Budgeting"
            desc="Set limits for your expenses. We'll warn you if you're spending too fast before your next payday arrives."
            color="rose"
          />
          <FeatureCard 
            icon={Wallet}
            title="Virtual Debt Accounts"
            desc="Easily track who owes you money or who you owe, without messing up your main expense reports."
            color="emerald"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  const colors: any = {
    indigo: 'bg-indigo-100 text-indigo-600',
    rose: 'bg-rose-100 text-rose-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}>
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-extrabold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
