import { useState } from 'react';
import { Delete } from 'lucide-react';

interface CalculatorProps {
  onResult: (val: number) => void;
}

export default function Calculator({ onResult }: CalculatorProps) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');

  const handleInput = (val: string) => {
    if (val === 'C') {
      setExpression('');
      setResult('0');
      onResult(0);
      return;
    }

    if (val === '=') {
      try {
        // Safe evaluation of basic math
        const sanitized = expression.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-new-func
        const res = new Function(`return ${sanitized}`)();
        const finalRes = Number.isFinite(res) ? res : 0;
        setResult(finalRes.toString());
        setExpression(finalRes.toString());
        onResult(finalRes);
      } catch (e) {
        setResult('Error');
      }
      return;
    }

    setExpression(prev => prev + val);
  };

  const handleDelete = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    'C', '0', '=', '+'
  ];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-end gap-1 shadow-inner">
        <span className="text-slate-400 text-sm h-5 font-mono">{expression || '0'}</span>
        <span className="text-3xl font-extrabold text-slate-800 font-mono tracking-tight break-all">
          {result}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {buttons.map(btn => (
          <button
            key={btn}
            type="button"
            onClick={() => handleInput(btn)}
            className={`
              h-12 rounded-xl font-bold text-lg transition-all active:scale-95
              ${btn === 'C' ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' :
                btn === '=' ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-200' :
                ['/', '*', '-', '+'].includes(btn) ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' :
                'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
              }
            `}
          >
            {btn}
          </button>
        ))}
        <button
            type="button"
            onClick={handleDelete}
            className="col-span-4 h-12 rounded-xl font-bold text-lg transition-all active:scale-95 bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center justify-center gap-2"
          >
            <Delete size={20} /> Backspace
          </button>
      </div>
    </div>
  );
}
