
import { Timestamp } from "firebase/firestore";

export interface Order {
  id: string;
  shopName: string;
  items: OrderItem[];
  totalPayment: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  createdAt: Timestamp;
  shippingAddress: any;
  shippingFee?: number;
  totalAmount?: number;
  shippingLink?: string;
  sellerId: string;
}




export interface ShippingAddress {
  barangay: string;
  city: string;
  createdAt: string;
  fullName: string;
  id: string;
  isDefault: boolean;
  phoneNumber: string;
  province: string;
  region: string;
  streetAddress: string;
  updatedAt: string;
}

export interface OrderItem {
  image: string;
  price: number;
  productId: string;
  productName: string;
  quantity: number;
  sellerId: string;
  shopName: string;
  variantId: string | null;
  variantText: string;
}
