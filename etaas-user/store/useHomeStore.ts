import { create } from "zustand";

interface HomeStore {
    productCategory:string;
    serviceCategory:string;
    setProductCategory: (category:string) => void;
    setServiceCategory: (category:string) => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
    productCategory: 'All',
    serviceCategory: 'All',
    setProductCategory: (category) => set({ productCategory: category }),
    setServiceCategory: (category) => set({ serviceCategory: category }),
}))