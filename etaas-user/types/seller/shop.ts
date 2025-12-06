import { VariantCategory,Variant } from "../product/product";
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
  images: string[];
  availability: 'available' | 'out of stock' | 'reserved'|'sold';
  createdAt: Date | any;
  description?: string;
  hasVariants?: boolean;
  variantCategories?: VariantCategory[];
  variants?: Variant[];
  sellerId: string;
}

export interface ShopData {
  shopName: string;
  businessName: string;
  addressLocation: string;
  contactNumber: string;
  email: string;
  rating?: number;
  reviewCount?: number;
  followers?: number;
  coverPhoto?: string;
  profilePhoto?: string;
  description?: string;
}

export interface UserData {
  uid: string;
  username: string;
  email: string;
  isSeller: boolean;
  sellerInfo?: {
    shopName: string;
    businessName: string;
    addressLocation: string;
    addressOfOwner: string;
    contactNumber: string;
    coverPhotoUrl?: string;
    profilePhotoUrl?: string;
    email: string;
    name: string;
    sellerId: number;
    registeredAt: string;
    uid: string;
  };
}

export type ViewMode = 'grid' | 'list';