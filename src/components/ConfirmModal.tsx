import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, isLoading }: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-800">{title}</h4>
          <p className="text-slate-500 mt-2 text-sm">
            {message}
          </p>
        </div>
        <div className="flex gap-3 w-full mt-6">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
