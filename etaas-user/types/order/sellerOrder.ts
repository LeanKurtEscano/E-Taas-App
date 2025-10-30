import { Timestamp } from "firebase/firestore";
import { CheckoutItem } from "../product/product";

export interface ShippingAddress {
  id: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  barangay: string;
  city: string;
  province: string;
  region: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  quantity: number;
  [key: string]: any;
}

export interface ProductData {
  hasVariants: boolean;
  variants?: ProductVariant[];
  quantity?: number;
  [key: string]: any;
}

export interface Order {
  id: string;
  userId: string;
  sellerId: string;
  shopName: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: CheckoutItem[];
  shippingAddress?: ShippingAddress;
  totalAmount: number;
  shippingFee: number;
  totalPayment: number;
  paymentStatus: string;
  shippingLink?: string;
  createdAt?: Timestamp;
  confirmedAt?: Timestamp;
  shippedAt?: Timestamp;
}