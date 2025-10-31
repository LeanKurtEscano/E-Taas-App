
import { Timestamp } from "firebase/firestore";
export interface OrderItem {
  productId: string;
  productName: string;
  variantText?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  shopName: string;
  items: OrderItem[];
  totalPayment: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid';
  createdAt: Timestamp;
  shippingAddress: any;
  sellerId: string;
}