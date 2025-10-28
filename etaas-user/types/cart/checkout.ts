export interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  productName: string;
  image: string;
  variantText: string;
  sellerId: string;
  shopName: string;
}
