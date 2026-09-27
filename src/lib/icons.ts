import { 
  Tags, Smile, Coffee, ShoppingBag, Car, Home, Heart, Smartphone,
  Utensils, Plane, Briefcase, GraduationCap, Gift,
  Music, Film, Gamepad2, Dumbbell, Stethoscope, 
  Wifi, Zap, Droplet, Flame, Scissors, Camera, Monitor, BookOpen,
  Banknote, Coins, CreditCard, Wallet, PiggyBank, Landmark, Receipt
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { name: 'Smile', component: Smile },
  { name: 'Coffee', component: Coffee },
  { name: 'Utensils', component: Utensils },
  { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'Car', component: Car },
  { name: 'Plane', component: Plane },
  { name: 'Home', component: Home },
  { name: 'Heart', component: Heart },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Monitor', component: Monitor },
  { name: 'Briefcase', component: Briefcase },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Gift', component: Gift },
  { name: 'Music', component: Music },
  { name: 'Film', component: Film },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Stethoscope', component: Stethoscope },
  { name: 'Wifi', component: Wifi },
  { name: 'Zap', component: Zap },
  { name: 'Droplet', component: Droplet },
  { name: 'Flame', component: Flame },
  { name: 'Scissors', component: Scissors },
  { name: 'Camera', component: Camera },
  { name: 'Tags', component: Tags },
  { name: 'Banknote', component: Banknote },
  { name: 'Coins', component: Coins },
  { name: 'CreditCard', component: CreditCard },
  { name: 'Wallet', component: Wallet },
  { name: 'PiggyBank', component: PiggyBank },
  { name: 'Landmark', component: Landmark },
  { name: 'Receipt', component: Receipt },
];

export function getCategoryIcon(iconName: string | undefined | null) {
  if (!iconName) return Tags;
  const found = AVAILABLE_ICONS.find(i => i.name === iconName);
  return found ? found.component : Tags;
}
