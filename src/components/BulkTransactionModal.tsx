import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Copy, ChevronDown, Layers, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import Modal from './Modal';
import { createBulkTransactions } from '../lib/queries';

export interface BulkRow {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  date: string;
  amount: number | '';
  category_id: string;
  account_id: string;
  to_account_id: string;
  note: string;
}

interface BulkTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  accounts: any[];
  initialDate?: Date;
}

let rowIdSeed = 0;
const generateRowId = () => `row_${Date.now()}_${++rowIdSeed}`;

const getLocalDatetimeString = (dateObj: Date = new Date()) => {
  const d = new Date(dateObj);
  const tzoffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
};

const formatCurrencyDisplay = (num: number | ''): string => {
  if (num === '' || num === 0 || isNaN(num as number)) return '';
  return Number(num).toLocaleString('id-ID');
};

const parseCurrencyInput = (val: string): number | '' => {
  const cleanVal = val.replace(/[^\d]/g, '');
  if (!cleanVal) return '';
  const parsed = parseInt(cleanVal, 10);
  return isNaN(parsed) ? '' : parsed;
};

const makeRow = (
  dateStr: string,
  accId: string,
  type: 'expense' | 'income' | 'transfer' = 'expense'
): BulkRow => ({
  id: generateRowId(),
  type,
  date: dateStr,
  amount: '',
  category_id: '',
  account_id: accId,
  to_account_id: '',
  note: ''
});

export default function BulkTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  accounts,
  initialDate
}: BulkTransactionModalProps) {
  if (!isOpen) return null;

  return (
    <BulkTransactionModalContent
      onClose={onClose}
      onSuccess={onSuccess}
      categories={categories}
      accounts={accounts}
      initialDate={initialDate}
    />
  );
}

function BulkTransactionModalContent({
  onClose,
  onSuccess,
  categories,
  accounts,
  initialDate
}: Omit<BulkTransactionModalProps, 'isOpen'>) {
  const initialDateStr = getLocalDatetimeString(initialDate || new Date());
  const initialAccId = accounts.length > 0 ? accounts[0].id : '';

  // Global / Default settings applied to new rows
  const [defaultDate, setDefaultDate] = useState(initialDateStr);
  const [defaultAccountId, setDefaultAccountId] = useState(initialAccId);
  const [defaultType, setDefaultType] = useState<'expense' | 'income'>('expense');

  // Rows state
  const [rows, setRows] = useState<BulkRow[]>(() => [
    makeRow(initialDateStr, initialAccId, 'expense'),
    makeRow(initialDateStr, initialAccId, 'expense'),
    makeRow(initialDateStr, initialAccId, 'expense')
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRow = () => {
    setRows(prev => [...prev, makeRow(defaultDate, defaultAccountId, defaultType)]);
  };

  const handleAddMultipleRows = (count: number) => {
    setRows(prev => [
      ...prev,
      ...Array.from({ length: count }, () => makeRow(defaultDate, defaultAccountId, defaultType))
    ]);
  };

  const handleDuplicateRow = (index: number) => {
    const target = rows[index];
    if (!target) return;
    const newRow: BulkRow = {
      ...target,
      id: generateRowId()
    };
    const nextRows = [...rows];
    nextRows.splice(index + 1, 0, newRow);
    setRows(nextRows);
    toast.success(`Baris #${index + 1} diduplikasi`);
  };

  const handleDeleteRow = (id: string) => {
    if (rows.length <= 1) {
      // Just clear the single row
      setRows([makeRow(defaultDate, defaultAccountId, defaultType)]);
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleResetRows = () => {
    setRows([
      makeRow(defaultDate, defaultAccountId, defaultType),
      makeRow(defaultDate, defaultAccountId, defaultType),
      makeRow(defaultDate, defaultAccountId, defaultType)
    ]);
    toast('Semua baris di-reset', { icon: '🔄' });
  };

  const handleUpdateRow = (id: string, field: keyof BulkRow, value: any) => {
    setRows(prev =>
      prev.map(row => {
        if (row.id !== id) return row;

        if (field === 'type') {
          const newType = value as 'expense' | 'income' | 'transfer';
          let updatedCatId = row.category_id;
          if (newType === 'transfer') {
            updatedCatId = '';
          } else {
            // Check if current category matches the new type
            const catMatches = categories.some(c => c.id === updatedCatId && c.type === newType);
            if (!catMatches) updatedCatId = '';
          }
          return { ...row, type: newType, category_id: updatedCatId };
        }

        if (field === 'note') {
          // Title case words
          const titleCased = (value as string).replace(/\b\w/g, c => c.toUpperCase());
          return { ...row, note: titleCased };
        }

        return { ...row, [field]: value };
      })
    );
  };

  // Apply default date or account to all unfilled rows or all rows
  const handleApplyDefaultsToAll = () => {
    setRows(prev =>
      prev.map(r => ({
        ...r,
        account_id: defaultAccountId || r.account_id,
        date: defaultDate || r.date
      }))
    );
    toast.success('Akun & Tanggal diterapkan ke semua baris');
  };

  // Summary calculations
  const filledRows = rows.filter(r => (typeof r.amount === 'number' && r.amount > 0) || r.note.trim() !== '' || r.category_id !== '');
  
  const totalExpense = rows
    .filter(r => r.type === 'expense' && typeof r.amount === 'number')
    .reduce((sum, r) => sum + (r.amount as number), 0);

  const totalIncome = rows
    .filter(r => r.type === 'income' && typeof r.amount === 'number')
    .reduce((sum, r) => sum + (r.amount as number), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter valid rows: row must have amount or note or category
    const activeRows = rows.filter(r => (typeof r.amount === 'number' && r.amount > 0) || r.note.trim() !== '' || r.category_id !== '');

    if (activeRows.length === 0) {
      toast.error('Mohon isi minimal 1 transaksi dengan jumlah lebih dari 0.');
      return;
    }

    // Validate each active row
    for (let i = 0; i < activeRows.length; i++) {
      const row = activeRows[i];
      const rowDisplayNum = rows.findIndex(r => r.id === row.id) + 1;

      if (!row.amount || row.amount <= 0) {
        toast.error(`Baris #${rowDisplayNum}: Jumlah transaksi harus lebih dari 0.`);
        return;
      }

      if (!row.account_id) {
        toast.error(`Baris #${rowDisplayNum}: Akun sumber dana wajib dipilih.`);
        return;
      }

      if (row.type !== 'transfer') {
        if (!row.category_id) {
          toast.error(`Baris #${rowDisplayNum}: Kategori transaksi wajib dipilih.`);
          return;
        }
      } else {
        if (!row.to_account_id) {
          toast.error(`Baris #${rowDisplayNum}: Akun tujuan transfer wajib dipilih.`);
          return;
        }
        if (row.account_id === row.to_account_id) {
          toast.error(`Baris #${rowDisplayNum}: Akun sumber dan tujuan transfer tidak boleh sama.`);
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      const payloads = activeRows.map(row => {
        const payload: any = {
          type: row.type,
          date: new Date(row.date).toISOString(),
          amount: Number(row.amount),
          note: row.note.trim() || (row.type === 'transfer' ? 'Transfer Antar Akun' : 'Transaksi'),
          account_id: row.account_id,
          is_safe_pay: false,
          safe_pay_status: null
        };

        if (row.type === 'transfer') {
          payload.to_account_id = row.to_account_id;
          payload.category_id = null;
        } else {
          payload.category_id = row.category_id;
          payload.to_account_id = null;
        }

        return payload;
      });

      await createBulkTransactions(payloads);
      toast.success(`Berhasil menyimpan ${payloads.length} transaksi sekaligus!`, { duration: 3500 });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to save bulk transactions:', err);
      toast.error(err?.message || 'Gagal menyimpan transaksi massal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Transaksi Massal (Bulk)" maxWidth="max-w-6xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Top Information & Quick Config Bar */}
        <div className="bg-gradient-to-r from-indigo-50/80 via-slate-50 to-indigo-50/50 p-4 md:p-5 rounded-2xl border border-indigo-100 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base">Pengaturan Cepat (Default Baris Baru)</h4>
                <p className="text-xs text-slate-500">Nilai default yang otomatis terisi ketika baris baru ditambahkan.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyDefaultsToAll}
              className="text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-200 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <Sparkles size={14} />
              Terapkan Akun & Tanggal ke Semua Baris
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-indigo-100/60">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal Default</label>
              <input
                type="datetime-local"
                value={defaultDate}
                onChange={e => setDefaultDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Akun Default</label>
              <div className="relative">
                <select
                  value={defaultAccountId}
                  onChange={e => setDefaultAccountId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 appearance-none bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">Pilih akun default...</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tipe Default</label>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDefaultType('expense')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                    defaultType === 'expense' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultType('income')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                    defaultType === 'income' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Pemasukkan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View: Table Layout (visible on lg screens) */}
        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100/80 text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3 w-32">Tipe</th>
                <th className="py-3 px-3 w-40">Jumlah (Rp)</th>
                <th className="py-3 px-3 w-44">Kategori</th>
                <th className="py-3 px-3 w-48">Akun</th>
                <th className="py-3 px-3">Catatan / Deskripsi</th>
                <th className="py-3 px-3 w-44">Tanggal & Waktu</th>
                <th className="py-3 px-2 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, index) => {
                const filteredCats = categories.filter(c => c.type === row.type);

                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-2.5 px-3 text-xs font-bold text-slate-400 text-center">
                      {index + 1}
                    </td>

                    {/* Tipe Selector */}
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <select
                          value={row.type}
                          onChange={e => handleUpdateRow(row.id, 'type', e.target.value)}
                          className={`w-full pl-2.5 pr-7 py-2 appearance-none rounded-xl text-xs font-bold border transition-colors ${
                            row.type === 'expense'
                              ? 'bg-rose-50/80 text-rose-700 border-rose-200 focus:ring-rose-500/40'
                              : row.type === 'income'
                              ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200 focus:ring-emerald-500/40'
                              : 'bg-indigo-50/80 text-indigo-700 border-indigo-200 focus:ring-indigo-500/40'
                          }`}
                        >
                          <option value="expense">Pengeluaran</option>
                          <option value="income">Pemasukkan</option>
                          <option value="transfer">Transfer</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </td>

                    {/* Jumlah (Rp) */}
                    <td className="py-2.5 px-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={formatCurrencyDisplay(row.amount)}
                          onChange={e => handleUpdateRow(row.id, 'amount', parseCurrencyInput(e.target.value))}
                          className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 ${
                            row.type === 'income'
                              ? 'text-emerald-700 border-slate-200 focus:ring-emerald-500/50'
                              : 'text-slate-800 border-slate-200 focus:ring-indigo-500/50'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-2.5 px-3">
                      {row.type === 'transfer' ? (
                        <div className="text-xs font-medium text-slate-400 italic px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                          Transfer (Tanpa Kategori)
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={row.category_id}
                            onChange={e => handleUpdateRow(row.id, 'category_id', e.target.value)}
                            className="w-full pl-3 pr-7 py-2 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          >
                            <option value="">Pilih kategori...</option>
                            {filteredCats.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      )}
                    </td>

                    {/* Akun */}
                    <td className="py-2.5 px-3">
                      {row.type !== 'transfer' ? (
                        <div className="relative">
                          <select
                            value={row.account_id}
                            onChange={e => handleUpdateRow(row.id, 'account_id', e.target.value)}
                            className="w-full pl-3 pr-7 py-2 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          >
                            <option value="">Pilih akun...</option>
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="relative flex-1">
                            <select
                              value={row.account_id}
                              onChange={e => handleUpdateRow(row.id, 'account_id', e.target.value)}
                              className="w-full pl-2 pr-6 py-2 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                              <option value="">Dari...</option>
                              {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                          <span className="text-slate-400 text-xs">➔</span>
                          <div className="relative flex-1">
                            <select
                              value={row.to_account_id}
                              onChange={e => handleUpdateRow(row.id, 'to_account_id', e.target.value)}
                              className="w-full pl-2 pr-6 py-2 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                              <option value="">Ke...</option>
                              {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Catatan / Deskripsi */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="Contoh: Makan Siang"
                        value={row.note}
                        onChange={e => handleUpdateRow(row.id, 'note', e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && index === rows.length - 1) {
                            e.preventDefault();
                            handleAddRow();
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </td>

                    {/* Tanggal & Waktu */}
                    <td className="py-2.5 px-3">
                      <input
                        type="datetime-local"
                        value={row.date}
                        onChange={e => handleUpdateRow(row.id, 'date', e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </td>

                    {/* Aksi */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(index)}
                          title="Duplikat Baris Ini"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          title="Hapus Baris Ini"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Card List (visible on screens < lg) */}
        <div className="lg:hidden flex flex-col gap-4">
          {rows.map((row, index) => {
            const filteredCats = categories.filter(c => c.type === row.type);

            return (
              <div
                key={row.id}
                className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col gap-3 relative"
              >
                {/* Header Card */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-extrabold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleUpdateRow(row.id, 'type', 'expense')}
                        className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                          row.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Pengeluaran
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateRow(row.id, 'type', 'income')}
                        className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                          row.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Pemasukkan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateRow(row.id, 'type', 'transfer')}
                        className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                          row.type === 'transfer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Transfer
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateRow(index)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Duplikat"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Amount & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Total (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={formatCurrencyDisplay(row.amount)}
                        onChange={e => handleUpdateRow(row.id, 'amount', parseCurrencyInput(e.target.value))}
                        className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 ${
                          row.type === 'income'
                            ? 'text-emerald-700 border-slate-200 focus:ring-emerald-500/50'
                            : 'text-slate-800 border-slate-200 focus:ring-indigo-500/50'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Catatan / Deskripsi</label>
                    <input
                      type="text"
                      placeholder="Contoh: Makan Siang"
                      value={row.note}
                      onChange={e => handleUpdateRow(row.id, 'note', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                {/* Category & Accounts */}
                {row.type !== 'transfer' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Kategori</label>
                      <div className="relative">
                        <select
                          value={row.category_id}
                          onChange={e => handleUpdateRow(row.id, 'category_id', e.target.value)}
                          className="w-full pl-3 pr-8 py-2.5 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                          <option value="">Pilih kategori...</option>
                          {filteredCats.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Akun</label>
                      <div className="relative">
                        <select
                          value={row.account_id}
                          onChange={e => handleUpdateRow(row.id, 'account_id', e.target.value)}
                          className="w-full pl-3 pr-8 py-2.5 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                          <option value="">Pilih akun...</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Dari Akun</label>
                      <div className="relative">
                        <select
                          value={row.account_id}
                          onChange={e => handleUpdateRow(row.id, 'account_id', e.target.value)}
                          className="w-full pl-3 pr-8 py-2.5 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                          <option value="">Dari...</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Ke Akun</label>
                      <div className="relative">
                        <select
                          value={row.to_account_id}
                          onChange={e => handleUpdateRow(row.id, 'to_account_id', e.target.value)}
                          className="w-full pl-3 pr-8 py-2.5 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                          <option value="">Ke...</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal & Waktu</label>
                  <input
                    type="datetime-local"
                    value={row.date}
                    onChange={e => handleUpdateRow(row.id, 'date', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Row Action Controls (+ Baris, + 3 Baris, Reset) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm border border-indigo-200 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus size={16} />
              Tambah Baris
            </button>
            <button
              type="button"
              onClick={() => handleAddMultipleRows(3)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all active:scale-95"
            >
              + 3 Baris
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetRows}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            Reset Baris
          </button>
        </div>

        {/* Bottom Summary & Submit Action Footer */}
        <div className="border-t border-slate-200 pt-5 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
            <div className="bg-slate-100 px-3 py-1.5 rounded-xl font-bold text-slate-700">
              Total Baris: <span className="text-indigo-600">{filledRows.length} terisi</span> / {rows.length}
            </div>
            {totalExpense > 0 && (
              <div className="text-rose-600 font-extrabold">
                Pengeluaran: - Rp {totalExpense.toLocaleString('id-ID')}
              </div>
            )}
            {totalIncome > 0 && (
              <div className="text-emerald-600 font-extrabold">
                Pemasukkan: + Rp {totalIncome.toLocaleString('id-ID')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all text-sm"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting || filledRows.length === 0}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Layers size={18} />
                  Simpan Semua Transaksi ({filledRows.length})
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </Modal>
  );
}
