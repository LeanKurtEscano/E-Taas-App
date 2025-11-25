export type SellerInfo = {
  addressLocation?: string;
  addressOfOwner?: string;
  businessName?: string;
  contactNumber?: string;
  email?: string;
  name?: string;
  registeredAt?: string;
  shopName?: string;
  sellerId?:number;
  uid?: string;
};

export type AppUser = {
  uid: string;
  email: string;
  authProvider: string;
  emailVerified: boolean;
  isSeller: boolean;
  profileComplete: boolean;
  createdAt?: string;
  updatedAt?: string;
  username?: string;
  sellerInfo?: SellerInfo | null;
};
