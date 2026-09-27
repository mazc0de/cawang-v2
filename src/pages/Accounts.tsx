import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, CreditCard, Wallet as WalletIcon, Landmark, Banknote, ChevronDown, Edit2, RefreshCw, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import CurrencyInput from '../components/CurrencyInput';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../lib/queries';
import { CardSkeleton } from '../components/Skeletons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Accounts() {
  useDocumentTitle('Accounts');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = form.accountName.value;
    const type = form.accountType.value;
    const balance = Number(form.initialBalance.value);

    try {
      await createAccount({ name, type, balance });
      setIsModalOpen(false);
      toast.success('Account added successfully!');
      loadAccounts();
    } catch (error: any) {
      toast.error('Failed to add account');
      console.error(error);
    }
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = form.accountName.value;
    const type = form.accountType.value;

    try {
      if (selectedAccount) {
        await updateAccount(selectedAccount.id, { name, type });
        setIsEditModalOpen(false);
        toast.success('Account updated successfully!');
        loadAccounts();
      }
    } catch (error: any) {
      toast.error('Failed to update account');
      console.error(error);
    }
  };

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const actualBalance = Number(form.actualBalance.value);

    try {
      if (selectedAccount) {
        await updateAccount(selectedAccount.id, { balance: actualBalance });
        setIsReconcileModalOpen(false);
        toast.success('Balance reconciled successfully!');
        loadAccounts();
      }
    } catch (error: any) {
      toast.error('Failed to reconcile balance');
      console.error(error);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteAccount(deleteId);
      toast.success('Account deleted!');
      setDeleteId(null);
      loadAccounts();
    } catch (error: any) {
      toast.error('Failed to delete account');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'e-wallet': return WalletIcon;
      case 'cash': return Banknote;
      case 'debt': return CreditCard;
      default: return Landmark;
    }
  };

  const getColorForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'e-wallet': return 'text-emerald-500 bg-emerald-100';
      case 'cash': return 'text-emerald-700 bg-emerald-200';
      case 'debt': return 'text-rose-500 bg-rose-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Accounts</h1>
          <p className="text-slate-500 mt-1">Manage your bank accounts, wallets, and cash.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      <div className="relative overflow-hidden hero-gradient rounded-[32px] p-8 flex flex-col shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[40px]"></div>
        <div className="relative z-10">
          <p className="text-indigo-100 font-semibold mb-2">Total Net Worth</p>
          <h2 className="text-5xl font-extrabold text-white tracking-tight">
            Rp {totalBalance.toLocaleString('id-ID')}
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white/50 rounded-3xl border border-slate-100">
          <p>No accounts set up yet.</p>
          <p className="text-sm">Click "Add Account" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => {
            const Icon = getIconForType(account.type);
            const colorClass = getColorForType(account.type);
            
            return (
              <div key={account.id} className="glass-card rounded-[24px] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full">
                        {account.type}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(account.id);
                        }}
                        className="p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-slate-500 font-medium text-sm mb-1">{account.name}</p>
                    <h3 className={`text-2xl font-extrabold ${Number(account.balance) < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      {Number(account.balance) < 0 ? '-' : ''}Rp {Math.abs(Number(account.balance)).toLocaleString('id-ID')}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100/50">
                  <button 
                    onClick={() => {
                      setSelectedAccount(account);
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedAccount(account);
                      setIsReconcileModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    <RefreshCw size={16} /> Reconcile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD ACCOUNT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Account">
        <form onSubmit={handleAddAccount} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Account Name</label>
            <input name="accountName" type="text" required placeholder="e.g., BCA Savings" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Account Type</label>
            <div className="relative">
              <select name="accountType" className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="Bank">Bank</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="Cash">Cash</option>
                <option value="Debt">Debt (Hutang/Piutang)</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Initial Balance (Rp)</label>
            <CurrencyInput name="initialBalance" required placeholder="0" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
            Save Account
          </button>
        </form>
      </Modal>

      {/* EDIT ACCOUNT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Account">
        <form onSubmit={handleEditAccount} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Account Name</label>
            <input 
              name="accountName" 
              type="text" 
              required 
              defaultValue={selectedAccount?.name}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Account Type</label>
            <div className="relative">
              <select 
                name="accountType" 
                defaultValue={selectedAccount?.type}
                className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="Bank">Bank</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="Cash">Cash</option>
                <option value="Debt">Debt (Hutang/Piutang)</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Balance / Saldo (Disabled)</label>
            <input 
              type="text" 
              disabled 
              value={`Rp ${Number(selectedAccount?.balance || 0).toLocaleString('id-ID')}`}
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl font-bold text-lg cursor-not-allowed" 
            />
            <p className="text-xs text-slate-400 mt-1">Use the Reconcile button on the card to update balance.</p>
          </div>
          <button type="submit" className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
            Update Account
          </button>
        </form>
      </Modal>

      {/* RECONCILE MODAL */}
      <Modal isOpen={isReconcileModalOpen} onClose={() => setIsReconcileModalOpen(false)} title="Reconcile Balance">
        <form onSubmit={handleReconcile} className="flex flex-col gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 text-sm">
            You are reconciling <strong>{selectedAccount?.name}</strong>. The system balance is currently <strong>Rp {Number(selectedAccount?.balance || 0).toLocaleString('id-ID')}</strong>. Enter the actual balance below to correct it.
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Actual Balance (Rp)</label>
            <CurrencyInput 
              name="actualBalance" 
              required 
              defaultValue={selectedAccount?.balance || 0}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
            />
          </div>
          
          <button type="submit" className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95">
            Save Adjustment
          </button>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={executeDelete}
        isLoading={isDeleting}
        title="Delete Account"
        message="Are you sure you want to delete this account? All associated transactions will be deleted. This action cannot be undone."
      />
    </div>
  );
}
