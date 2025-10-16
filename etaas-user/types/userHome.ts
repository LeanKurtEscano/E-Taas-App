import { LucideIcon } from 'lucide-react-native';

export interface Category {
  id: number;
  title: string;
  emoji: string;
  color: string;
}

export interface Promo {
  id: number;
  title: string;
  subtitle?: string;
  emoji: string;
  bgClass: string;
}

export interface Feature {
  icon: any;
  title: string;
  subtitle?: string;
}


export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}


export interface CategoryCardProps {
  item: Category;
  onPress: (category: Category) => void;
}
