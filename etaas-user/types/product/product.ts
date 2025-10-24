
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