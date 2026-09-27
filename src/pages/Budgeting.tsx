import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, ChevronDown, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import CurrencyInput from '../components/CurrencyInput';
import { getBudgets, deleteBudget, getCategories, createBudget, updateBudget, getTransactions, getSettings } from '../lib/queries';
import { getCategoryIcon } from '../lib/icons';
import { BudgetCardSkeleton } from '../components/Skeletons';
import { getCycleDates } from '../lib/utils';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Budgeting() {
  useDocumentTitle('Budgeting');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ salary_cycle_start_date: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    try {
      setLoading(true);
      const [budgetsData, catsData, txData, settingsData] = await Promise.all([
        getBudgets(),
        getCategories(),
        getTransactions(),
        getSettings()
      ]);
      setBudgets(budgetsData);
      setCategories(catsData);
      setTransactions(txData);
      setSettings(settingsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const cycleDates = getCycleDates(settings.salary_cycle_start_date);
  
  // Create an array of budgets with their computed spent amount
  const budgetsWithSpent = budgets.map(b => {
    const spent = transactions
      .filter(t => 
        t.category_id === b.category_id && 
        t.type === 'expense' && 
        new Date(t.date) >= cycleDates.start &&
        new Date(t.date) <= cycleDates.end
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { ...b, spent };
  });

  const totalLimit = budgetsWithSpent.reduce((acc, curr) => acc + Number(curr.amount_limit), 0);
  const totalSpent = budgetsWithSpent.reduce((acc, curr) => acc + curr.spent, 0);
  const overallProgress = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      await createBudget({
        category_id: form.category.value,
        amount_limit: Number(form.limit.value)
      });
      
      setIsModalOpen(false);
      toast.success('Budget saved successfully!');
      loadBudgets();
    } catch (error: any) {
      toast.error('Failed to save budget');
      console.error(error);
    }
  };

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget) return;
    
    const form = e.target as HTMLFormElement;
    
    try {
      await updateBudget(selectedBudget.id, {
        category_id: form.category.value,
        amount_limit: Number(form.limit.value)
      });
      
      setIsEditModalOpen(false);
      setSelectedBudget(null);
      toast.success('Budget updated successfully!');
      loadBudgets();
    } catch (error: any) {
      toast.error('Failed to update budget');
      console.error(error);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteBudget(deleteId);
      toast.success('Budget deleted!');
      setDeleteId(null);
      loadBudgets();
    } catch (error: any) {
      toast.error('Failed to delete budget');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Budgeting</h1>
          <p className="text-slate-500 mt-1">Manage limits for this Salary Cycle.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          New Budget
        </button>
      </div>

      <div className="glass-panel rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 border-l-8 border-l-indigo-500">
        <div className="w-full md:w-1/3">
          <p className="text-slate-500 font-medium mb-1">Cycle Summary</p>
          <h3 className="text-3xl font-extrabold text-slate-800">Rp {totalSpent.toLocaleString('id-ID')}</h3>
          <p className="text-sm font-bold mt-2 text-slate-500">of Rp {totalLimit.toLocaleString('id-ID')} limit</p>
        </div>
        <div className="w-full md:w-2/3">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-slate-600">Overall Usage</span>
            <span className={overallProgress >= 100 ? 'text-rose-500' : 'text-indigo-600'}>
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${overallProgress >= 100 ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BudgetCardSkeleton />
          <BudgetCardSkeleton />
          <BudgetCardSkeleton />
          <BudgetCardSkeleton />
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white/50 rounded-3xl border border-slate-100">
          <p>No budgets set up yet.</p>
          <p className="text-sm">Click "New Budget" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgetsWithSpent.map(b => {
            const spent = b.spent;
            const progress = (spent / b.amount_limit) * 100;
            const isOver = progress > 100;
            const isMaxed = progress === 100;
            const isWarning = progress >= 80 && progress < 100;

            return (
              <div key={b.id} className="glass-card rounded-[24px] p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      {(() => {
                        const IconCmp = getCategoryIcon(b.categories?.icon);
                        return <IconCmp size={20} />;
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-800">{b.categories?.name || 'Category'}</h3>
                      <button 
                        onClick={() => {
                          setSelectedBudget(b);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors"
                        title="Edit Budget"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(b.id)}
                        className="p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Budget"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {isOver ? (
                        <span className="text-rose-500">Over Budget</span>
                      ) : isMaxed ? (
                        <span className="text-rose-500">Pas Limit</span>
                      ) : isWarning ? (
                        <span className="text-amber-500">Hampir Habis</span>
                      ) : (
                        <span className="text-slate-500">Aman / Sisa</span>
                      )}
                    </p>
                    <p className={`font-extrabold ${isOver ? 'text-rose-500' : 'text-slate-800'}`}>
                      {isOver ? '-' : ''}Rp {Math.abs(b.amount_limit - spent).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">Rp {spent.toLocaleString('id-ID')}</span>
                    <span className={(isOver || isMaxed) ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        (isOver || isMaxed) ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Budget">
        <form onSubmit={handleAddBudget} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Expense Category</label>
            <div className="relative">
              <select name="category" required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="">Pilih kategori...</option>
                {categories
                  .filter(c => !budgets.some(b => b.category_id === c.id))
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                }
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Budget Limit (Rp)</label>
            <CurrencyInput name="limit" required placeholder="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
            Save Budget
          </button>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedBudget(null); }} title="Edit Budget">
        {selectedBudget && (
          <form onSubmit={handleEditBudget} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Expense Category</label>
              <div className="relative">
                <select name="category" defaultValue={selectedBudget.category_id} required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                  <option value="">Pilih kategori...</option>
                  {categories
                    .filter(c => c.id === selectedBudget.category_id || !budgets.some(b => b.category_id === c.id))
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Budget Limit (Rp)</label>
              <CurrencyInput name="limit" defaultValue={selectedBudget.amount_limit} required placeholder="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
              Update Budget
            </button>
          </form>
        )}
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        isLoading={isDeleting}
        title="Delete Budget"
        message="Are you sure you want to delete this budget limit? This action cannot be undone."
      />
    </div>
  );
}
