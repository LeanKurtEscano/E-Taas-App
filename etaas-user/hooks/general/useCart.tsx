// hooks/useCart.ts
import { useState } from "react";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, runTransaction, serverTimestamp } from "firebase/firestore";

import { db } from "@/config/firebaseConfig";

import { Product } from "@/types/product/product";

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
      console.error('Error getting stock:', error);
      return 0;
    }
  };


  const updateCartItemQuantity = async (
    userId: string,
    productId: string,
    variantId: string | undefined,
    newQuantity: number
  ): Promise<{ success: boolean; message?: string; stock?: number }> => {
    try {
    
      if (newQuantity < 0) {
        return { success: false, message: 'Invalid quantity' };
      }

     
      if (newQuantity === 0) {
        return await deleteCartItem(userId, productId, variantId);
      }

      const availableStock = await getItemStock(productId, variantId);

    
      if (newQuantity > availableStock) {
        return {
          success: false,
          message: `Only ${availableStock} items available in stock`,
          stock: availableStock
        };
      }

     
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        return { success: false, message: 'Cart not found' };
      }

      const cartData = cartSnap.data();
      const items = cartData.items as CartItem[];

      const updatedItems = items.map((item) => {
        const isMatch = item.productId === productId &&
          item.variantId === variantId;

        if (isMatch) {
          return {
            ...item,
            quantity: newQuantity,
            updatedAt: new Date()
          };
        }
        return item;
      });

      
      await updateDoc(cartRef, { items: updatedItems });

      return { success: true, message: 'Quantity updated successfully' };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, message: 'Failed to update quantity' };
    }
  };

 
  const incrementCartItemQuantity = async (
    userId: string,
    productId: string,
    variantId: string | undefined,
    currentQuantity: number
  ): Promise<{ success: boolean; message?: string; stock?: number }> => {
    try {
      const availableStock = await getItemStock(productId, variantId);

    
      if (currentQuantity >= availableStock) {
        return {
          success: false,
          message: `Maximum stock of ${availableStock} reached`,
          stock: availableStock
        };
      }

      return await updateCartItemQuantity(
        userId,
        productId,
        variantId,
        currentQuantity + 1
      );
    } catch (error) {
      console.error('Error incrementing quantity:', error);
      return { success: false, message: 'Failed to increment quantity' };
    }
  };


  const decrementCartItemQuantity = async (
    userId: string,
    productId: string,
    variantId: string | undefined,
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
        productId,
        variantId,
        currentQuantity - 1
      );
    } catch (error) {
      console.error('Error decrementing quantity:', error);
      return { success: false, message: 'Failed to decrement quantity' };
    }
  };

 
  const deleteCartItem = async (
    userId: string,
    productId: string,
    variantId?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        return { success: false, message: 'Cart not found' };
      }

      const cartData = cartSnap.data();
      const items = cartData.items as CartItem[];

    
      const updatedItems = items.filter((item) => {
        const isMatch = item.productId === productId &&
          item.variantId === variantId;
        return !isMatch;
      });

    
      if (updatedItems.length === 0) {
        // Option 1: Keep cart with empty items array
        await updateDoc(cartRef, { items: [] });

        // Option 2: Delete cart document entirely (uncomment if preferred)
        // await deleteDoc(cartRef);
      } else {
        await updateDoc(cartRef, { items: updatedItems });
      }

      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, message: 'Failed to remove item' };
    }
  };

 
  const deleteMultipleCartItems = async (
    userId: string,
    itemsToDelete: Array<{ productId: string; variantId?: string }>
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        return { success: false, message: 'Cart not found' };
      }

      const cartData = cartSnap.data();
      const items = cartData.items as CartItem[];

   
      const updatedItems = items.filter((item) => {
        return !itemsToDelete.some(
          (deleteItem) =>
            deleteItem.productId === item.productId &&
            deleteItem.variantId === item.variantId
        );
      });

      // Update cart
      if (updatedItems.length === 0) {
        await updateDoc(cartRef, { items: [] });
      } else {
        await updateDoc(cartRef, { items: updatedItems });
      }

      return {
        success: true,
        message: `${itemsToDelete.length} item(s) removed from cart`
      };
    } catch (error) {
      console.error('Error deleting multiple items:', error);
      return { success: false, message: 'Failed to remove items' };
    }
  };


  const clearCart = async (
    userId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const cartRef = doc(db, 'carts', userId);

    
      await updateDoc(cartRef, { items: [] });

     
      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('Error clearing cart:', error);
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