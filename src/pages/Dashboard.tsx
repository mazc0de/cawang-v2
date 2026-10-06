import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, ShieldCheck, Info, CheckCircle2, Calendar, CalendarDays } from 'lucide-react';
import { getTransactions, getAccounts, getBudgets, getSettings } from '../lib/queries';
import { getCycleDates } from '../lib/utils';
import { getCategoryIcon } from '../lib/icons';
import { ListSkeleton } from '../components/Skeletons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ salary_cycle_start_date: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [txns, accs, bdgts, sets] = await Promise.all([
          getTransactions(), 
          getAccounts(),
          getBudgets(),
          getSettings()
        ]);
        setTransactions(txns);
        setAccounts(accs);
        setBudgets(bdgts);
        setSettings(sets);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const availableBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
  const safePayLocked = transactions.filter(t => t.is_safe_pay && t.safe_pay_status === 'PENDING').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalBalance = availableBalance + safePayLocked;
  
  // Today's Transactions
  const today = new Date();
  const todayTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  });
  
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  // This Cycle's Transactions
  const cycleDates = getCycleDates(settings.salary_cycle_start_date);
  const currentCycleTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= cycleDates.start && d <= cycleDates.end;
  });
  
  const cycleIncome = currentCycleTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const cycleExpense = currentCycleTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  // Transactions Today
  const recentTransactions = todayTransactions;

  // Budget Left calculation
  const cycleExpenses = currentCycleTransactions.filter(t => t.type === 'expense');
  
  const totalLimit = budgets.reduce((acc, curr) => acc + Number(curr.amount_limit), 0);
  
  // Only calculate spent for expenses that are tied to a category that has a budget
  const budgetCategoryIds = budgets.map(b => b.category_id);
  const spentOnBudgets = cycleExpenses
    .filter(t => budgetCategoryIds.includes(t.category_id))
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
  const budgetLeft = totalLimit - spentOnBudgets;

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    return `${datePart}, ${timePart}`;
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden hero-gradient rounded-3xl md:rounded-[40px] p-6 md:p-10 flex flex-col md:flex-row shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-[60px]"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-900/30 rounded-full blur-[60px]"></div>
        
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-4 md:mb-6">
            ✨ Welcome back!
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-xl flex flex-wrap items-center gap-2">
            <span>You have</span>
            <span className={budgetLeft >= 0 ? "text-emerald-300 flex items-center gap-2" : "text-rose-300 flex items-center gap-2"}>
              Rp {Math.abs(budgetLeft).toLocaleString('id-ID')}
              <div className="relative group flex items-center justify-center">
                <Info size={28} className="text-white/70 hover:text-white cursor-pointer transition-colors" />
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                  Budget Left
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
                </div>
              </div>
            </span>
            <span>{budgetLeft >= 0 ? 'left to spend' : 'over budget'} this cycle.</span>
          </h1>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Balance" amount={`Rp ${totalBalance.toLocaleString('id-ID')}`} trend="All accounts + Safe-Pay" icon={Wallet} color="indigo" />
          <StatCard title="Available Balance" amount={`Rp ${availableBalance.toLocaleString('id-ID')}`} trend="Active balance" icon={CheckCircle2} color="emerald" />
          <StatCard title="Safe-Pay" amount={`Rp ${safePayLocked.toLocaleString('id-ID')}`} trend="Locked Funds" icon={ShieldCheck} color="indigo" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummaryStatCard title="Today" income={todayIncome} expense={todayExpense} icon={Calendar} />
          <SummaryStatCard title="This Cycle" income={cycleIncome} expense={cycleExpense} icon={CalendarDays} />
        </div>
      </div>

      {/* Schedule & AI Insights Row */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-panel rounded-[32px] p-8">
          <h2 className="text-xl font-extrabold text-slate-800 mb-6">Transactions Today</h2>
          {loading ? (
            <ListSkeleton />
          ) : recentTransactions.length === 0 ? (
            <div className="text-center text-slate-500 p-8">
              No transactions yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/50 transition-colors cursor-pointer border border-transparent hover:border-white/60">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {(() => {
                        const IconCmp = getCategoryIcon(t.categories?.icon);
                        return <IconCmp size={20} />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{t.note || 'Transaction'}</h3>
                      <p className="text-sm text-slate-500">{t.categories?.name || 'General'} • {formatDateTime(t.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {t.type === 'income' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights - Temporarily hidden
        <div className="bg-[#312e81] rounded-[32px] p-8 shadow-xl shadow-indigo-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]"></div>
          <h2 className="text-xl font-extrabold text-white mb-6 relative z-10 flex items-center gap-2">
            <BrainCircuit size={24} className="text-indigo-400" />
            AI Insights
          </h2>
          <div className="flex flex-col gap-4 relative z-10">
            <div className="bg-indigo-900/50 border border-indigo-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <span className="text-indigo-200 text-sm font-bold tracking-wider uppercase">Info</span>
              </div>
              <p className="text-white text-sm leading-relaxed">Start adding transactions to get personalized insights on your spending habits.</p>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}

function StatCard({ title, amount, trend, icon: Icon, color }: any) {
  const colorMap: any = {
    indigo: 'text-indigo-600 bg-indigo-600/10',
    emerald: 'text-emerald-600 bg-emerald-600/10',
    rose: 'text-rose-600 bg-rose-600/10',
    amber: 'text-amber-600 bg-amber-600/10',
  };
  
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-800">{amount}</h3>
        <p className="text-sm font-bold mt-2 text-emerald-600">{trend}</p>
      </div>
    </div>
  );
}

function SummaryStatCard({ title, income, expense, icon: Icon }: any) {
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-600/10 text-indigo-600">
            <Icon size={24} />
          </div>
          <h3 className="text-slate-800 font-bold text-lg">{title}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <TrendingUp size={16} />
            <span className="text-xs font-bold tracking-wider uppercase">Income</span>
          </div>
          <p className="font-bold text-slate-800 text-lg">Rp {income.toLocaleString('id-ID')}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-rose-600">
            <TrendingDown size={16} />
            <span className="text-xs font-bold tracking-wider uppercase">Expense</span>
          </div>
          <p className="font-bold text-slate-800 text-lg">Rp {expense.toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
}
