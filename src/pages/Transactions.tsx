import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, ArrowRightLeft, ChevronDown, Trash2, ChevronLeft, ChevronRight, Calendar, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Calculator from '../components/Calculator';
import CurrencyInput from '../components/CurrencyInput';
import { getTransactions, deleteTransaction, getAccounts, getCategories, createTransaction, updateTransaction } from '../lib/queries';
import { getCategoryIcon } from '../lib/icons';
import { TableSkeleton } from '../components/Skeletons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Transactions() {
  useDocumentTitle('Transactions');
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [transactionType, setTransactionType] = useState<'expense'|'income'|'transfer'>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [noteStr, setNoteStr] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      const [txData, catData, accData] = await Promise.all([
        getTransactions(),
        getCategories(),
        getAccounts()
      ]);
      setTransactions(txData);
      setCategories(catData);
      setAccounts(accData);
    } catch (error) {
      console.error('Failed to load transactions', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      const payload: any = {
        type: transactionType,
        date: new Date(form.date.value).toISOString(),
        amount: amount,
        note: form.desc.value,
      };

      if (transactionType === 'transfer') {
        payload.account_id = form.source_account.value;
        payload.to_account_id = form.dest_account.value;
      } else {
        payload.account_id = form.account.value;
        payload.category_id = form.category.value;
      }

      await createTransaction(payload);
      
      setIsModalOpen(false);
      toast.success('Transaction saved successfully!');
      loadTransactions();
    } catch (error: any) {
      toast.error('Failed to save transaction');
      console.error(error);
    }
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    const form = e.target as HTMLFormElement;
    
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      const payload: any = {
        type: transactionType,
        date: new Date(form.date.value).toISOString(),
        amount: amount,
        note: form.desc.value,
      };

      if (transactionType === 'transfer') {
        payload.account_id = form.source_account.value;
        payload.to_account_id = form.dest_account.value;
        payload.category_id = null;
      } else {
        payload.account_id = form.account.value;
        payload.category_id = form.category.value;
        payload.to_account_id = null;
      }

      await updateTransaction(selectedTransaction.id, payload);
      
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
      toast.success('Transaction updated successfully!');
      loadTransactions();
    } catch (error: any) {
      toast.error('Failed to update transaction');
      console.error(error);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteTransaction(deleteId);
      toast.success('Transaction deleted!');
      setDeleteId(null);
      loadTransactions();
    } catch (error: any) {
      toast.error('Failed to delete transaction');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper for datetime-local default value
  const getLocalDatetime = (baseDate: Date) => {
    const d = new Date();
    d.setFullYear(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    const tzoffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const isSameDate = (dateStr: string, dateObj: Date) => {
    const d = new Date(dateStr);
    return d.getDate() === dateObj.getDate() && 
           d.getMonth() === dateObj.getMonth() && 
           d.getFullYear() === dateObj.getFullYear();
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timePart = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    return `${datePart}, ${timePart}`;
  };

  const dailyTransactions = transactions.filter(t => isSameDate(t.date, selectedDate));
  const filteredTransactions = dailyTransactions.filter(t => activeTab === 'All' || t.type.toLowerCase() === activeTab.toLowerCase());
  
  const dailyIncome = dailyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const dailyExpense = dailyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  
  const isToday = isSameDate(new Date().toISOString(), selectedDate);

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Transactions</h1>
          <p className="text-slate-500 mt-1">Manage and track all your financial activities.</p>
        </div>
        <button 
          onClick={() => {
            setTransactionType('expense');
            setAmount(0);
            setNoteStr('');
            setIsModalOpen(true);
          }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-4 md:px-5 md:py-2.5 rounded-full md:rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 fixed bottom-6 right-6 z-40 md:static md:z-auto"
        >
          <Plus size={24} className="md:w-5 md:h-5" />
          <span className="hidden md:inline">New Transaction</span>
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 mb-2 gap-4">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl hidden sm:block">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Sedang Dilihat</p>
            <div className="flex items-center gap-2 md:gap-3">
              <h2 className="text-lg md:text-2xl font-extrabold text-slate-800">
                {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              {isToday && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-widest">
                  Hari Ini
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-8 ml-auto mr-8 text-right hidden md:flex">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pemasukkan</p>
            <p className="text-lg font-bold text-emerald-500">+ Rp {dailyIncome.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengeluaran</p>
            <p className="text-lg font-bold text-rose-500">- Rp {dailyExpense.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl">
          <button 
            onClick={() => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}
            className="p-3 bg-white shadow-sm hover:shadow-md text-slate-600 rounded-xl transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setSelectedDate(new Date())}
            className="px-6 py-3 bg-white shadow-sm hover:shadow-md font-bold text-slate-700 rounded-xl transition-all"
          >
            Hari Ini
          </button>
          <button 
            onClick={() => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}
            className="p-3 bg-white shadow-sm hover:shadow-md text-slate-600 rounded-xl transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-panel rounded-3xl md:rounded-[32px] p-4 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center w-full">
          <div className="flex items-center gap-1 md:gap-2 bg-slate-100/50 p-1 rounded-2xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['All', 'Income', 'Expense', 'Transfer'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[200px]">
          {loading ? (
            <div className="py-4">
              <TableSkeleton />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <p>No transactions found for this date.</p>
              <p className="text-sm">Click "New Transaction" to add one.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="py-4 font-semibold w-12">Type</th>
                  <th className="py-4 font-semibold">Description</th>
                  <th className="py-4 font-semibold">Category</th>
                  <th className="py-4 font-semibold">Account</th>
                  <th className="py-4 font-semibold">Date</th>
                  <th className="py-4 font-semibold text-right">Amount</th>
                  <th className="py-4 font-semibold w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 
                        t.type === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'
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
                    <td className="py-4 font-bold text-slate-800">{t.note || 'No description'}</td>
                    <td className="py-4 text-sm text-slate-600 font-medium">
                      {t.type === 'transfer' ? 'Transfer' : t.categories?.name || '-'}
                    </td>
                    <td className="py-4 text-sm text-slate-600 font-medium">{t.accounts?.name || '-'}</td>
                    <td className="py-4 text-sm text-slate-500">{formatDateTime(t.date)}</td>
                    <td className={`py-4 text-right font-extrabold ${
                      t.type === 'income' ? 'text-emerald-600' : 
                      t.type === 'expense' ? 'text-slate-800' : 'text-slate-600'
                    }`}>
                      {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''} Rp {Number(t.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => {
                            setSelectedTransaction(t);
                            setTransactionType(t.type);
                            setAmount(Number(t.amount));
                            setNoteStr(t.note || '');
                            setSelectedDate(new Date(t.date));
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(t.id)}
                          className="p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Transaction" maxWidth="max-w-4xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Form Section */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Type Toggle Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                type="button"
                onClick={() => setTransactionType('expense')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  transactionType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Pengeluaran
              </button>
              <button 
                type="button"
                onClick={() => setTransactionType('income')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  transactionType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Pemasukkan
              </button>
              <button 
                type="button"
                onClick={() => setTransactionType('transfer')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  transactionType === 'transfer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Transfer
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
              
              {/* Date & Time Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal & Waktu</label>
                <div className="relative">
                  <input 
                    name="date" 
                    type="datetime-local" 
                    value={getLocalDatetime(selectedDate)}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    required 
                    className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
                  />
                  <p className="text-xs text-slate-400 mt-2 font-medium bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
                    {formatDateTime(selectedDate.toISOString())}
                  </p>
                </div>
              </div>

              {/* Amount Field (Syncs with calculator) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Total (Rp)</label>
                <CurrencyInput 
                  name="amount" 
                  value={amount || 0}
                  onChange={(val) => setAmount(val)}
                  required 
                  placeholder="0" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-2xl text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
                />
              </div>

              {/* Conditional Fields based on Type */}
              {transactionType !== 'transfer' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                    <div className="relative">
                      <select name="category" required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <option value="">Pilih kategori...</option>
                        {categories
                          .filter(c => 
                            transactionType === 'expense' ? c.type === 'expense' : 
                            transactionType === 'income' ? c.type === 'income' : true
                          )
                          .map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))
                        }
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Account</label>
                    <div className="relative">
                      <select name="account" required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <option value="">Pilih sumber dana...</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Sumber Account</label>
                    <div className="relative">
                      <select name="source_account" required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <option value="">Dari account...</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tujuan Account</label>
                    <div className="relative">
                      <select name="dest_account" required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                        <option value="">Ke account...</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Note / Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Catatan / Deskripsi</label>
                <input 
                  name="desc" 
                  type="text" 
                  required
                  placeholder="Contoh: Ayam Goreng" 
                  value={noteStr}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Capitalize first letter of every word
                    const titleCased = val.replace(/\b\w/g, c => c.toUpperCase());
                    setNoteStr(titleCased);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
                />
              </div>

              <button type="submit" className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-extrabold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-95">
                Simpan Transaksi
              </button>
            </form>
          </div>

          {/* Right Calculator Section */}
          <div className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              Kalkulator
            </h4>
            <Calculator onResult={(val) => setAmount(val)} />
          </div>

        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedTransaction(null); }} title="Edit Transaction" maxWidth="max-w-4xl">
        {selectedTransaction && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button type="button" onClick={() => setTransactionType('expense')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${transactionType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pengeluaran</button>
                <button type="button" onClick={() => setTransactionType('income')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${transactionType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pemasukkan</button>
                <button type="button" onClick={() => setTransactionType('transfer')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${transactionType === 'transfer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Transfer</button>
              </div>

              <form onSubmit={handleEditTransaction} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal & Waktu</label>
                  <div className="relative">
                    <input 
                      name="date" 
                      type="datetime-local" 
                      value={getLocalDatetime(selectedDate)}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      required 
                      className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
                    />
                    <p className="text-xs text-slate-400 mt-2 font-medium bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
                      {formatDateTime(selectedDate.toISOString())}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Total (Rp)</label>
                  <CurrencyInput name="amount" value={amount || 0} onChange={(val) => setAmount(val)} required placeholder="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-2xl text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>

                {transactionType !== 'transfer' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                      <div className="relative">
                        <select name="category" defaultValue={selectedTransaction.category_id} required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                          <option value="">Pilih kategori...</option>
                          {categories.filter(c => transactionType === 'expense' ? c.type === 'expense' : transactionType === 'income' ? c.type === 'income' : true).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Account</label>
                      <div className="relative">
                        <select name="account" defaultValue={selectedTransaction.account_id} required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                          <option value="">Pilih sumber dana...</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Sumber Account</label>
                      <div className="relative">
                        <select name="source_account" defaultValue={selectedTransaction.account_id} required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                          <option value="">Dari account...</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Tujuan Account</label>
                      <div className="relative">
                        <select name="dest_account" defaultValue={selectedTransaction.to_account_id} required className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                          <option value="">Ke account...</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Catatan / Deskripsi</label>
                  <input name="desc" type="text" required placeholder="Contoh: Ayam Goreng" value={noteStr} onChange={(e) => { const val = e.target.value; const titleCased = val.replace(/\b\w/g, c => c.toUpperCase()); setNoteStr(titleCased); }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                </div>

                <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
                  Update Transaction
                </button>
              </form>
            </div>
            
            <div className="hidden lg:block w-[320px] shrink-0 border-l border-slate-100 pl-8">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">
                Kalkulator
              </h4>
              <Calculator onResult={(val) => setAmount(val)} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        isLoading={isDeleting}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone and will affect your account balance."
      />
    </div>
  );
}
