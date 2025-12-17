import { create } from "zustand";
import { SellerInfo, AppUser } from "@/types/user/currentUser";
import { authorizeApiClient } from "@/config/general/auth";
import * as SecureStore from 'expo-secure-store';
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
              ...state.userData.sellerInfo,
              ...info,
            },
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
      sellerInfo: data.seller_data
        ? {
            sellerId: data.seller_data.id,
            businessName: data.seller_data.business_name,
            addressLocation: data.seller_data.business_address,
            contactNumber: data.seller_data.business_contact,
            name: data.seller_data.display_name,
            addressOfOwner: data.seller_data.owner_address,
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
      
      const response = await authorizeApiClient.get('/user-details');
      if (response.data && response.data.user) {
        get().mapUserFromBackend(response.data.user);
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