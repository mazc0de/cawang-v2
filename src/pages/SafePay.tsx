import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArrowRightLeft, Trash2, CheckCircle2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import Modal from '../components/Modal';
import CurrencyInput from '../components/CurrencyInput';
import { getSafePayTransactions, updateTransaction, deleteTransaction } from '../lib/queries';
import { getCategoryIcon } from '../lib/icons';
import { TableSkeleton } from '../components/Skeletons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function SafePay() {
  useDocumentTitle('Safe-Pay');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      const data = await getSafePayTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions', error);
    } finally {
      setLoading(false);
    }
  }

  const executeComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    try {
      setIsProcessing(true);
      await updateTransaction(selectedTx.id, { 
        amount: finalAmount,
        safe_pay_status: 'COMPLETED' 
      });
      toast.success('Transaksi Safe-Pay berhasil diselesaikan!');
      setSelectedTx(null);
      loadTransactions();
    } catch (error: any) {
      toast.error('Gagal menyelesaikan transaksi');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      setIsProcessing(true);
      await deleteTransaction(deleteId);
      toast.success('Safe-Pay dibatalkan, dana dikembalikan!');
      setDeleteId(null);
      loadTransactions();
    } catch (error: any) {
      toast.error('Gagal membatalkan transaksi');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return `${datePart}`;
  };

  const totalSafePay = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">Safe-Pay</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Transaksi tertunda yang dananya disisihkan.</p>
        </div>
        <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100">
          <p className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-1">Total Dana Disisihkan</p>
          <p className="text-2xl font-extrabold text-indigo-700">Rp {totalSafePay.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl md:rounded-[32px] p-4 md:p-8 flex flex-col gap-6">
        <div className="overflow-x-auto min-h-[200px]">
          {loading ? (
            <div className="py-4"><TableSkeleton /></div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 dark:text-slate-400">
              <p>Tidak ada transaksi Safe-Pay yang tertunda.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500 dark:text-slate-400">
                  <th className="py-4 font-semibold w-12">Type</th>
                  <th className="py-4 font-semibold">Description</th>
                  <th className="py-4 font-semibold">Category</th>
                  <th className="py-4 font-semibold">Date</th>
                  <th className="py-4 font-semibold text-right">Amount</th>
                  <th className="py-4 font-semibold w-32 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 
                        t.type === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600 dark:text-slate-300'
                      }`}>
                        {t.type === 'transfer' ? (
                          <ArrowRightLeft size={18} />
                        ) : (
                          (() => {
                            const IconCmp = getCategoryIcon(t.categories?.icon);
                            return <IconCmp size={18} />;
                          })()
                        )}
                      </div>
                    </td>
                    <td className="py-4 font-bold text-slate-800 dark:text-slate-200">{t.note || 'No description'}</td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {t.type === 'transfer' ? 'Transfer' : t.categories?.name || '-'}
                    </td>
                    <td className="py-4 text-sm text-slate-500 dark:text-slate-400">{formatDateTime(t.date)}</td>
                    <td className={`py-4 text-right font-extrabold ${
                      t.type === 'income' ? 'text-emerald-600' : 
                      t.type === 'expense' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      Rp {Number(t.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTx(t);
                            setFinalAmount(Number(t.amount));
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors font-bold text-xs"
                        >
                          <CheckCircle2 size={14} /> Selesaikan
                        </button>
                        <button 
                          onClick={() => setDeleteId(t.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-colors font-bold text-xs"
                        >
                          <Trash2 size={14} /> Batal
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        isLoading={isProcessing}
        title="Batalkan Safe-Pay"
        message="Anda yakin ingin membatalkan transaksi ini? Uang akan dikembalikan ke saldo aktif."
      />

      <Modal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        title="Selesaikan Transaksi" 
        maxWidth="max-w-md"
      >
        <form onSubmit={executeComplete} className="flex flex-col gap-6">
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Anda dapat menyesuaikan nominal akhir transaksi sebelum menyelesaikannya.
            Selisih dana akan otomatis disesuaikan dengan saldo utama Anda.
          </p>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nominal Akhir (Rp)</label>
            <CurrencyInput 
              name="amount" 
              value={finalAmount || 0}
              onChange={(val) => setFinalAmount(val)}
              required 
              placeholder="0" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-2xl text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-extrabold text-lg shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-70"
          >
            {isProcessing ? 'Memproses...' : 'Konfirmasi Penyelesaian'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
