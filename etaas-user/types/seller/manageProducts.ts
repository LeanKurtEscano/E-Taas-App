import { Product } from "./shop";


export interface Statistics {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}

export interface ProductCardProps {
  product: Product;
  showDeleteModal: (productId: string) => void;
}