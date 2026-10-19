import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import { useHideAmounts, type AmountCardKey } from '../hooks/useHideAmounts';

interface AmountToggleProps {
  cardKey: AmountCardKey;
  size?: number;
  // Replaces the default padding/color classes, e.g. for cards on a dark background
  className?: string;
}

export default function AmountToggle({ cardKey, size = 16, className }: AmountToggleProps) {
  const { isHidden, toggleCard } = useHideAmounts();
  const hidden = isHidden(cardKey);
  const label = hidden ? 'Tampilkan nominal' : 'Sembunyikan nominal';

  return (
    <button
      type="button"
      onClick={() => toggleCard(cardKey)}
      title={label}
      aria-label={label}
      aria-pressed={hidden}
      className={clsx(
        'inline-flex items-center justify-center shrink-0 transition-colors',
        className ?? 'p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600'
      )}
    >
      {hidden ? <EyeOff size={size} /> : <Eye size={size} />}
    </button>
  );
}
