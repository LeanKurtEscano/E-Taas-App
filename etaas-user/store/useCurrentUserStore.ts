import { create } from "zustand";
import { SellerInfo, AppUser } from "@/types/user/currentUser";
import { authorizeApiClient } from "@/config/general/auth";
import * as SecureStore from 'expo-secure-store';
import { userApiClient } from "@/config/user/user";
type State = {
  userData: AppUser | null;
  loading: boolean;
  setUserData: (user: AppUser) => void;
  setLoading: (loading: boolean) => void;
  updateSellerInfo: (info: Partial<SellerInfo>) => void;
  clearUser: () => void;
  mapUserFromBackend: (data: any) => void;
  fetchCurrentUser: () => Promise<void>;
};

export const useCurrentUser = create<State>((set, get) => ({
  userData: null,
  loading: true, // Start with true since we need to check auth on app load

  setUserData: (user) => set({ userData: user }),

  setLoading: (loading) => set({ loading }),

  updateSellerInfo: (info) =>
    set((state) => ({
      userData: state.userData
        ? {
          ...state.userData,
          sellerInfo: {
            ...(state.userData.sellerInfo || {}),
            ...info,
          } as SellerInfo,
        }
        : null,
    })),

  clearUser: async () => {
    await SecureStore.deleteItemAsync('etaas_access_token');
    set({ userData: null, loading: false });
  },


  mapUserFromBackend: (data) => {
    const mappedUser: AppUser = {
      id: String(data.id),
      username: data.username,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      middleName: data.middle_name,
      address: data.address,
      contactNumber: data.contact_number,
      isAdmin: data.is_admin,
      isSeller: data.is_seller,
      sellerInfo: data.seller
        ? {
          sellerId: data.seller.id,
          businessName: data.seller.business_name,
          addressLocation: data.seller.business_address,
          contactNumber: data.seller.business_contact,
          name: data.seller.display_name,
          addressOfOwner: data.seller.owner_address,
          isSellerMode: data.seller.is_seller_mode,
        }
        : null,
    };

    set({ userData: mappedUser, loading: false });
  },

  fetchCurrentUser: async () => {
    try {
      set({ loading: true });

      const token = await SecureStore.getItemAsync('etaas_access_token');


      if (!token) {

        set({ userData: null, loading: false });
        return;
      }

      const response = await userApiClient.get('/user-details');
      if (response.data && response.data) {
        get().mapUserFromBackend(response.data);
      } else {
        set({ userData: null, loading: false });
      }
    } catch (error) {
      console.log("Failed to fetch current user:", error);
      // Clear invalid token
      await SecureStore.deleteItemAsync('etaas_access_token');
      set({ userData: null, loading: false });
    }
  },
}));