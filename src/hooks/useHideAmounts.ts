import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'cawang:hidden-amounts';
export const AMOUNT_MASK = '••••••';

// Every card whose amount can be hidden; "show all / hide all" applies to these
export const AMOUNT_CARD_KEYS = [
  'dashboard.budgetLeft',
  'dashboard.totalBalance',
  'dashboard.availableBalance',
  'dashboard.safePay',
  'dashboard.today',
  'dashboard.cycle',
] as const;

export type AmountCardKey = (typeof AMOUNT_CARD_KEYS)[number];

type HiddenCards = Partial<Record<AmountCardKey, boolean>>;

const listeners = new Set<() => void>();

function readStoredValue(): HiddenCards {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

let hiddenCards = readStoredValue();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setHiddenCards(next: HiddenCards) {
  hiddenCards = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (e.g. private mode) – keep the in-memory value only
  }
  listeners.forEach((listener) => listener());
}

function areAllHidden(cards: HiddenCards) {
  return AMOUNT_CARD_KEYS.every((key) => cards[key]);
}

// Per-card show/hide state for money amounts, persisted so hidden cards stay hidden after reload
export function useHideAmounts() {
  const current = useSyncExternalStore(subscribe, () => hiddenCards);

  return {
    allHidden: areAllHidden(current),
    isHidden: (cardKey: AmountCardKey) => Boolean(current[cardKey]),
    formatAmount: (value: number, cardKey: AmountCardKey) =>
      current[cardKey] ? AMOUNT_MASK : value.toLocaleString('id-ID'),
    toggleCard: (cardKey: AmountCardKey) =>
      setHiddenCards({ ...hiddenCards, [cardKey]: !hiddenCards[cardKey] }),
    // Shows everything when all cards are hidden, otherwise hides everything
    toggleAll: () =>
      setHiddenCards(
        areAllHidden(hiddenCards) ? {} : Object.fromEntries(AMOUNT_CARD_KEYS.map((key) => [key, true]))
      ),
  };
}
