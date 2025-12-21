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
  isSellerMode:boolean;
};

export type AppUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  address?: string;
  contactNumber?: string;
  isAdmin: boolean;
  isSeller: boolean;
  username?: string;
  sellerInfo?: SellerInfo | null;
};
