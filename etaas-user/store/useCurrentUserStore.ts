import { create } from "zustand";

import { SellerInfo,AppUser } from "@/types/user/currentUser";
type State = {
  userData: AppUser | null;
  setUserData: (user: AppUser) => void;
  updateSellerInfo: (info: Partial<SellerInfo>) => void;
  clearUser: () => void;
};

export const useCurrentUser = create<State>((set) => ({
  userData: null,

  // save the logged in user data globally
  setUserData: (user) => set({ userData: user }),

  // update only the sellerInfo object
  updateSellerInfo: (info) =>
    set((state) => ({
      userData: state.userData
        ? {
            ...state.userData,
            sellerInfo: {
              ...state.userData.sellerInfo,
              ...info,
            },
          }
        : null,
    })),


  clearUser: () => set({ userData: null }),
}));
