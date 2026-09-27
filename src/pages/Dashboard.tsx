import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Activity, BrainCircuit } from 'lucide-react';
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

  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
  
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
  
  // Transactions Today
  const recentTransactions = todayTransactions;

  // Budget Left calculation
  const cycleDates = getCycleDates(settings.salary_cycle_start_date);
  const cycleExpenses = transactions.filter(t => 
    t.type === 'expense' && 
    new Date(t.date) >= cycleDates.start &&
    new Date(t.date) <= cycleDates.end
  );
  
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
      <div className="relative overflow-hidden hero-gradient rounded-[40px] p-10 flex flex-col md:flex-row shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/20 rounded-full blur-[60px]"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-900/30 rounded-full blur-[60px]"></div>
        
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-6">
            ✨ Welcome back!
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight max-w-xl">
            You have <span className={budgetLeft >= 0 ? "text-emerald-300" : "text-rose-300"}>Rp {Math.abs(budgetLeft).toLocaleString('id-ID')}</span> {budgetLeft >= 0 ? 'left to spend' : 'over budget'} this cycle.
          </h1>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance" amount={`Rp ${totalBalance.toLocaleString('id-ID')}`} trend="Up to date" icon={Wallet} color="indigo" />
        <StatCard title="Income (Today)" amount={`Rp ${todayIncome.toLocaleString('id-ID')}`} trend="Today" icon={TrendingUp} color="emerald" />
        <StatCard title="Expense (Today)" amount={`Rp ${todayExpense.toLocaleString('id-ID')}`} trend="Today" icon={TrendingDown} color="rose" />
        <StatCard title="Budget Left" amount={`Rp ${budgetLeft.toLocaleString('id-ID')}`} trend="This cycle" icon={Activity} color="amber" />
      </div>

      {/* Schedule & AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-[32px] p-8">
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
