// hooks/useCart.ts
import { useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, runTransaction, serverTimestamp } from "firebase/firestore";

import { db } from "@/config/firebaseConfig";

import { Product } from "@/types/product/product";

export interface CartItem {
  cartId: string; // Unique identifier for each cart item
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

// Helper function to generate unique cartId
export const generateCartId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
};

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
          // Create new cart with cartId
          const newCart: Cart = {
            items: [
              {
                cartId: generateCartId(),
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
          // Update quantity of existing item (keep same cartId)
          items[existingIndex] = {
            ...items[existingIndex],
            quantity: items[existingIndex].quantity + quantity,
          };
        } else {
          // Add new item with new cartId
          items.push({
            cartId: generateCartId(),
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

  const getItemStock = async (
    productId: string,
    variantId?: string
  ): Promise<number> => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));

      if (!productDoc.exists()) {
        return 0;
      }

      const product = productDoc.data() as Product;

      if (product.availability !== 'available') {
        return 0;
      }

      if (variantId && product.variants) {
        const variant = product.variants.find(v => v.id === variantId);
        return variant?.stock || 0;
      }

      return product.quantity || 0;
    } catch (error) {
    
      return 0;
    }
  };

  const updateCartItemQuantity = async (
    userId: string,
    cartId: string,
    newQuantity: number
  ): Promise<{ success: boolean; message?: string; stock?: number }> => {
    try {
      if (newQuantity < 0) {
        return { success: false, message: 'Invalid quantity' };
      }

      if (newQuantity === 0) {
        return await deleteCartItem(userId, cartId);
      }

      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        return { success: false, message: 'Cart not found' };
      }

      const cartData = cartSnap.data();
      const items = cartData.items as CartItem[];
      console.log("cartId:", cartId);
      console.log('Items in cart:', items);

      const item = items.find(i => i.cartId == cartId);
      if (!item) {
        return { success: false, message: 'Item not found in cart' };
      }

      const availableStock = await getItemStock(item.productId, item.variantId || undefined);

      if (newQuantity > availableStock) {
        return {
          success: false,
          message: `Only ${availableStock} items available in stock`,
          stock: availableStock
        };
      }

      const updatedItems = items.map((item) => {
        if (item.cartId === cartId) {
          return {
            ...item,
            quantity: newQuantity,
          };
        }
        return item;
      });

      await updateDoc(cartRef, { items: updatedItems, updatedAt: new Date() });

      return { success: true, message: 'Quantity updated successfully' };
    } catch (error) {
     
      return { success: false, message: 'Failed to update quantity' };
    }
  };

  const incrementCartItemQuantity = async (
    userId: string,
    cartId: string,
    currentQuantity: number
  ): Promise<{ success: boolean; message?: string; stock?: number }> => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        return { success: false, message: 'Cart not found' };
      }

      const cartData = cartSnap.data();
      const items = cartData.items as CartItem[];
      const item = items.find(i => i.cartId === cartId);

      if (!item) {
        return { success: false, message: 'Item not found in cart' };
      }

      const availableStock = await getItemStock(item.productId, item.variantId || undefined);

      if (currentQuantity >= availableStock) {
        return {
          success: false,
          message: `Maximum stock of ${availableStock} reached`,
          stock: availableStock
        };
      }

      return await updateCartItemQuantity(
        userId,
        cartId,
        currentQuantity + 1
      );
    } catch (error) {
     
      return { success: false, message: 'Failed to increment quantity' };
    }
  };

  const decrementCartItemQuantity = async (
    userId: string,
    cartId: string,
    currentQuantity: number
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      if (currentQuantity <= 1) {
        return {
          success: false,
          message: 'Use delete button to remove item'
        };
      }

      return await updateCartItemQuantity(
        userId,
        cartId,
        currentQuantity - 1
      );
    } catch (error) {
      
      return { success: false, message: 'Failed to decrement quantity' };
    }
  };

  const deleteCartItem = async (
    userId: string,
    cartId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        return { success: false, message: 'Cart not found' };
      }

      const cartData = cartSnap.data();
      const items = cartData.items as CartItem[];

      const updatedItems = items.filter((item) => item.cartId !== cartId);

      if (updatedItems.length === 0) {
        await updateDoc(cartRef, { items: [], updatedAt: new Date() });
      } else {
        await updateDoc(cartRef, { items: updatedItems, updatedAt: new Date() });
      }

      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
     
      return { success: false, message: 'Failed to remove item' };
    }
  };

  const deleteMultipleCartItems = async (
    userId: string,
    cartIds: string[]
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        return { success: false, message: 'Cart not found' };
      }

      const cartData = cartSnap.data();
      const items = cartData.items as CartItem[];

      const updatedItems = items.filter((item) => !cartIds.includes(item.cartId));

      if (updatedItems.length === 0) {
        await updateDoc(cartRef, { items: [], updatedAt: new Date() });
      } else {
        await updateDoc(cartRef, { items: updatedItems, updatedAt: new Date() });
      }

      return {
        success: true,
        message: `${cartIds.length} item(s) removed from cart`
      };
    } catch (error) {
     
      return { success: false, message: 'Failed to remove items' };
    }
  };

  const clearCart = async (
    userId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const cartRef = doc(db, 'carts', userId);

      await updateDoc(cartRef, { items: [], updatedAt: new Date() });

      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
     
      return { success: false, message: 'Failed to clear cart' };
    }
  };

  return {
    loading,
    cartError,
    showCartToast,
    setShowCartToast,
    handleAddToCartDirect,
    handleAddToCartVariant,
    clearError,
    incrementCartItemQuantity,
    decrementCartItemQuantity,
    deleteCartItem,
    deleteMultipleCartItems,
    clearCart,
    updateCartItemQuantity,
    getItemStock,
  };
};