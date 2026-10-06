import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, RefreshCw, ChevronDown } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import CurrencyInput from '../components/CurrencyInput';
import { getRecurring, deleteRecurring, getSettings, updateSettings } from '../lib/queries';
import { ListSkeleton } from '../components/Skeletons';
import { getCycleDates } from '../lib/utils';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Settings() {
  useDocumentTitle('Settings');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [recurring, setRecurring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleDate, setCycleDate] = useState<number>(1);
  const [isSavingCycle, setIsSavingCycle] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [recurringData, settingsData] = await Promise.all([
        getRecurring(),
        getSettings()
      ]);
      setRecurring(recurringData);
      setCycleDate(settingsData.salary_cycle_start_date);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecurring() {
    try {
      const data = await getRecurring();
      setRecurring(data);
    } catch (error) {
      console.error(error);
    }
  }

  const handleSaveCycle = async () => {
    try {
      setIsSavingCycle(true);
      await updateSettings({ salary_cycle_start_date: cycleDate });
      toast.success('Salary cycle updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update settings');
    } finally {
      setIsSavingCycle(false);
    }
  };

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsModalOpen(false);
      toast.success('Recurring transaction saved!');
      loadRecurring();
    } catch (error: any) {
      toast.error('Failed to save recurring transaction');
      console.error(error);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteRecurring(deleteId);
      toast.success('Recurring transaction deleted!');
      setDeleteId(null);
      loadRecurring();
    } catch (error: any) {
      toast.error('Failed to delete recurring transaction');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your account and application preferences.</p>
      </div>

      <div className="glass-panel rounded-[32px] p-8 flex flex-col gap-6">
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200 border-b border-slate-200 pb-4 flex justify-between items-center">
          Salary Cycle Setup
          <button 
            onClick={handleSaveCycle}
            disabled={isSavingCycle}
            className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save size={16} />
            {isSavingCycle ? 'Saving...' : 'Save Cycle'}
          </button>
        </h2>
        
        <div className="flex flex-col gap-2">
          <label className="font-bold text-slate-700">Salary Date (Cycle Start)</label>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            The date you receive your salary every month. All budgeting and analytics will be based on a period starting from this date to the day before it next month.
          </p>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select 
                value={cycleDate} 
                onChange={e => setCycleDate(Number(e.target.value))}
                className="pl-4 pr-10 py-3 appearance-none rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {(() => {
              const cycleDates = getCycleDates(cycleDate);
              const formatMonthYear = (date: Date) => date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
              const cycleLabel = `${cycleDates.start.getDate()} ${formatMonthYear(cycleDates.start)} - ${cycleDates.end.getDate()} ${formatMonthYear(cycleDates.end)}`;
              return (
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                  Current Cycle: {cycleLabel}
                </span>
              )
            })()}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[32px] p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-200">Recurring Transactions</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-indigo-600 font-bold flex items-center gap-2 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw size={16} /> Add New
          </button>
        </div>
        
        {loading ? (
          <ListSkeleton />
        ) : recurring.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">No recurring transactions set up yet.</p>
        ) : (
          recurring.map(r => (
            <div key={r.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{r.note || 'Recurring'}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Every {r.frequency} • Rp {Number(r.amount).toLocaleString('id-ID')}</p>
              </div>
              <button onClick={() => setDeleteId(r.id)} className="text-rose-500 font-semibold text-sm hover:underline">Remove</button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95">
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Recurring Transaction">
        <form onSubmit={handleAddRecurring} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <input name="desc" type="text" required placeholder="e.g., Netflix Subscription" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Amount (Rp)</label>
            <CurrencyInput name="amount" required placeholder="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
            Save Recurring Setup
          </button>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        isLoading={isDeleting}
        title="Delete Recurring Item"
        message="Are you sure you want to delete this recurring transaction? Future transactions will not be created automatically."
      />
    </div>
  );
}
