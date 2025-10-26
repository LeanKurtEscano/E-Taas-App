// hooks/useCart.ts
import { useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion,runTransaction,serverTimestamp } from "firebase/firestore";

import { db } from "@/config/firebaseConfig";



export interface CartItem {
  productId: string;
  sellerId: string;
  hasVariants: boolean;
  variantId: string | null;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  updatedAt: Date;
}

interface AddToCartProps {
  userId: string;
  productId: string;
  sellerId: string;
  hasVariants: boolean;
  variantId?: string | null;
  quantity?: number;
}
export const useCart = () => {
  const [loading, setLoading] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [showCartToast, setShowCartToast] = useState(false);

  const addToCart = async ({
    userId,
    productId,
    sellerId,
    hasVariants,
    variantId = null,
    quantity = 1,
  }: AddToCartProps) => {
    // Validation
    if (!userId || !productId || !sellerId) {
      throw new Error("Missing required fields");
    }

    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const cartRef = doc(db, "carts", userId);

    try {
      await runTransaction(db, async (transaction) => {
        const cartSnap = await transaction.get(cartRef);

        if (!cartSnap.exists()) {
          // Create new cart
          const newCart: Cart = {
            items: [
              {
                productId,
                sellerId,
                hasVariants,
                variantId,
                quantity,
                addedAt: new Date(),
              },
            ],
            updatedAt: new Date(),
          };
          transaction.set(cartRef, newCart);
          return;
        }

        // Update existing cart
        const cartData = cartSnap.data() as Cart;
        const items = cartData.items || [];

        // Find existing item
        const existingIndex = items.findIndex(
          (item: CartItem) =>
            item.productId === productId &&
            item.variantId === (variantId || null)
        );

        if (existingIndex !== -1) {
          // Update quantity of existing item
          items[existingIndex] = {
            ...items[existingIndex],
            quantity: items[existingIndex].quantity + quantity,
          };
        } else {
          // Add new item
          items.push({
            productId,
            sellerId,
            hasVariants,
            variantId,
            quantity,
            addedAt: new Date(),
          });
        }

        transaction.update(cartRef, {
          items,
          updatedAt: new Date(),
        });
      });
    } catch (err: any) {
      console.error("Add to cart error:", err);
      throw new Error(err.message || "Failed to add item to cart");
    }
  };

  const handleAddToCartDirect = async ({
    userId,
    productId,
    sellerId,
  }: Omit<AddToCartProps, "hasVariants" | "variantId" | "quantity">) => {
    if (!userId) {
      setCartError("Please log in to add to cart.");
      return false;
    }

    setLoading(true);
    setCartError(null);

    try {
      await addToCart({
        userId,
        productId,
        sellerId,
        hasVariants: false,
        quantity: 1,
      });
      setShowCartToast(true);
      return true;
    } catch (error: any) {
      setCartError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartVariant = async ({
    userId,
    productId,
    sellerId,
    variantId,
    quantity = 1,
  }: Omit<AddToCartProps, "hasVariants">) => {
    if (!userId) {
      setCartError("Please log in to add to cart.");
      return false;
    }

    if (!variantId) {
      setCartError("Please select a variant.");
      return false;
    }

    setLoading(true);
    setCartError(null);

    try {
      await addToCart({
        userId,
        productId,
        sellerId,
        hasVariants: true,
        variantId,
        quantity,
      });
      setShowCartToast(true);
      return true;
    } catch (error: any) {
      setCartError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setCartError(null);

  return {
    loading,
    cartError,
    showCartToast,
    setShowCartToast,
    handleAddToCartDirect,
    handleAddToCartVariant,
    clearError,
  };
};