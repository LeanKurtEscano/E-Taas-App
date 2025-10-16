// Mock Data
import { Category, Promo, Feature } from "@/types/userHome";
 import { 
  ShoppingCart, 
  Zap, 
  Package, 
  Shield, 
  ChevronRight 
} from 'lucide-react-native';

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, title: 'Produce', emoji: '🥗', color: '#10B981' },
  { id: 2, title: 'Pantry', emoji: '🥫', color: '#F59E0B' },
  { id: 3, title: 'Bakery', emoji: '🍕', color: '#EF4444' },
  { id: 4, title: 'Electronics', emoji: '📱', color: '#3B82F6' },
  { id: 5, title: 'Beverages', emoji: '🥤', color: '#8B5CF6' },
  { id: 6, title: 'Snacks', emoji: '🍿', color: '#EC4899' },
];

export const MOCK_PROMOS: Promo[] = [
  { 
    id: 1, 
    title: 'Hot Deals & Delicious Foods!', 
    emoji: '🥘', 
    bgClass: 'bg-slate-800' 
  },
  { 
    id: 2, 
    title: 'Appliances Available', 
    subtitle: 'Best Deals', 
    emoji: '🎧', 
    bgClass: 'bg-yellow-600' 
  },
];

export const FEATURES: Feature[] = [
  { icon: Zap, title: 'Fast', subtitle: 'Delivery' },
  { icon: Package, title: 'Great', subtitle: 'Packaging' },
  { icon: Shield, title: 'Trusted', subtitle: 'Sources' },
];
