
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
