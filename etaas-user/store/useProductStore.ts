// store/useProductStore.ts
import { create } from 'zustand';
import { fetchAllProducts } from '@/services/user/browse/allProducts';
import { Product } from '@/types/seller/shop';

interface ProductStore {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setProducts: (products: Product[]) => void;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setProducts: (products) => set({ products }),

  fetchProducts: async () => {
    const query = get().searchQuery;
    const allProducts = await fetchAllProducts();

    const filtered = query
      ? allProducts.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        )
      : allProducts;

    set({ products: filtered });
  },
}));
