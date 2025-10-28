
export interface VariantCategory {
  id: string;
  name: string;
  values: string[];
}

export interface Variant {
  id: string;
  combination: string[];
  price: number;
  stock: number;
  image?: string;
}


export interface Product {
  id?: string;
  name: string;
  description: string;
  images?: string[];
  hasVariants: boolean;
  price?: number;
  quantity?: number;
  variantCategories?: VariantCategory[];
  variants?: Variant[];
  availability?: string;
  category?: string;
  sellerId?: string;
  [key: string]: any;
}



export interface CartItem {
  productId: string;
  hasVariants: boolean;
  variantId: string | null;
  quantity: number;
  sellerId: string;
  addedAt: any;
  updatedAt: any;
}

export interface CartCardProps {
  sellerId: string;
  items: CartItem[];
  userId: string;
  onUpdate?: () => void;
}



export interface ProductData {
  product: Product;
  variant: Variant | null;
  price: number;
  stock: number;
  image: string;
  variantText: string;
}

export interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  productName: string;
  image: string;
  variantText: string;
  sellerId: string;
  shopName: string;
}