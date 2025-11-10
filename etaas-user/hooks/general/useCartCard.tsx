import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { db } from '@/config/firebaseConfig';
import { useCart } from './useCart';
import { CartItem,Product,ProductData,CheckoutItem } from '@/types/product/product';
import { useMemo } from 'react';
export const useCartCard = (
  userId: string,
  sellerId: string,
  items: CartItem[],
  onUpdate?: () => void
) => {
  const [shopName, setShopName] = useState<string>('');
  const [productsData, setProductsData] = useState<Map<string, ProductData>>(new Map());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null);
  const [localQuantities, setLocalQuantities] = useState<Map<string, number>>(new Map());

  const { incrementCartItemQuantity, decrementCartItemQuantity, deleteCartItem } = useCart();


  useEffect(() => {
    fetchData();
  }, [sellerId, items]);

  useEffect(() => {
    const quantityMap = new Map<string, number>();
    items.forEach(item => {
      const key = item.productId + (item.variantId || '');
      quantityMap.set(key, item.quantity);
    });
    setLocalQuantities(quantityMap);
  }, [items]);

  const fetchData = async () => {
    try {
     
      const sellerDoc = await getDoc(doc(db, 'users', sellerId));
      if (sellerDoc.exists()) {
        const sellerData = sellerDoc.data() as { sellerInfo?: { shopName: string } };
        setShopName(sellerData.sellerInfo?.shopName || 'Unknown Shop');
      }

    
      const productsMap = new Map<string, ProductData>();
      for (const item of items) {
        const productDoc = await getDoc(doc(db, 'products', item.productId));
        if (!productDoc.exists()) continue;

        const product = productDoc.data() as Product;
        let productData: ProductData;

        if (item.hasVariants && item.variantId) {
          const variant = product.variants?.find(v => v.id === item.variantId);
          if (variant) {
            const variantText = product.variantCategories
              ?.map((cat, idx) => `${cat.name}: ${variant.combination[idx]}`)
              .join(', ') || '';
            productData = {
              product,
              variant,
              price: variant.price,
              stock: variant.stock,
              image: variant.image || product.images[0] || '',
              variantText
            };
          } else {
            productData = {
              product,
              variant: null,
              price: 0,
              stock: 0,
              image: product.images[0] || '',
              variantText: 'Variant not available'
            };
          }
        } else {
          productData = {
            product,
            variant: null,
            price: product.price,
            stock: product.quantity,
            image: product.images[0] || '',
            variantText: ''
          };
        }

        productsMap.set(item.productId + (item.variantId || ''), productData);
      }

      setProductsData(productsMap);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleIncrement = async (item: CartItem) => {
    const key = item.productId + (item.variantId || '');
    const currentLocalQty = localQuantities.get(key) || item.quantity;
    setUpdatingQuantity(key);

    setLocalQuantities(prev => new Map(prev).set(key, currentLocalQty + 1));

    try {
      const result = await incrementCartItemQuantity(userId, item.productId, item.variantId, currentLocalQty);
      if (result.success) onUpdate?.();
      else {
        setLocalQuantities(prev => new Map(prev).set(key, currentLocalQty));
        Alert.alert('Stock Limit', result.message || 'Cannot increase quantity');
      }
    } catch (error) {
      setLocalQuantities(prev => new Map(prev).set(key, currentLocalQty));
      Alert.alert('Error', 'Failed to update quantity');
      console.error('Error incrementing quantity:', error);
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const handleDecrement = async (item: CartItem) => {
    const key = item.productId + (item.variantId || '');
    const currentLocalQty = localQuantities.get(key) || item.quantity;

    if (currentLocalQty === 1) {
      handleDeleteItem(item);
      return;
    }

    setUpdatingQuantity(key);
    setLocalQuantities(prev => new Map(prev).set(key, currentLocalQty - 1));

    try {
      const result = await decrementCartItemQuantity(userId, item.productId, item.variantId, currentLocalQty);
      if (result.success) onUpdate?.();
      else {
        setLocalQuantities(prev => new Map(prev).set(key, currentLocalQty));
        Alert.alert('Error', result.message || 'Cannot decrease quantity');
      }
    } catch (error) {
      setLocalQuantities(prev => new Map(prev).set(key, currentLocalQty));
      Alert.alert('Error', 'Failed to update quantity');
      console.error('Error decrementing quantity:', error);
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const handleDeleteItem = async (item: CartItem) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await deleteCartItem(userId, item.productId, item.variantId);
            if (result.success) onUpdate?.();
            else Alert.alert('Error', result.message || 'Failed to remove item');
          } catch (error) {
            Alert.alert('Error', 'Failed to remove item. Please try again.');
            console.error('Error deleting item:', error);
          }
        }
      }
    ]);
  };


  const toggleItemSelection = (key: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      const allKeys = items.map(item => item.productId + (item.variantId || ''));
      setSelectedItems(new Set(allKeys));
    }
  };

  const calculateShopTotal = () => {
    let total = 0;
    items.forEach(item => {
      const key = item.productId + (item.variantId || '');
      const data = productsData.get(key);
      const quantity = localQuantities.get(key) || item.quantity;
      if (data && selectedItems.has(key)) {
        total += data.price * quantity;
      }
    });
    return total;
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) return;

    const checkoutItems: CheckoutItem[] = [];
    let totalAmount = 0;

    items.forEach(item => {
      const key = item.productId + (item.variantId || '');
      if (selectedItems.has(key)) {
        const data = productsData.get(key);
        const quantity = localQuantities.get(key) || item.quantity;
        if (data) {
          const itemTotal = data.price * quantity;
          totalAmount += itemTotal;
          checkoutItems.push({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity,
            price: data.price,
            productName: data.product.name,
            image: data.image,
            variantText: data.variantText,
            sellerId,
            shopName
          });
        }
      }
    });

    router.replace({
      pathname: '/cart/checkout',
      params: {
        items: JSON.stringify(checkoutItems),
        sellerId,
        shopName,
        totalAmount: totalAmount.toString(),
        itemCount: selectedItems.size.toString()
      }
    });
  };

  const hasSelectedItems = selectedItems.size > 0;
  const shopTotal = calculateShopTotal();
  const allSelected = selectedItems.size === items.length && items.length > 0;

   const isStockLow = useMemo(() => {
    return [...productsData].some(([key, data]) => {
      const localQty = localQuantities.get(key) || 0;
      return data.stock < localQty;
    });
  }, [productsData, localQuantities]);


  return {
    shopName,
    isStockLow,
    productsData,
    selectedItems,
    loading,
    updatingQuantity,
    localQuantities,
    hasSelectedItems,
    shopTotal,
    allSelected,
    handleIncrement,
    handleDecrement,
    handleDeleteItem,
    toggleItemSelection,
    toggleSelectAll,
    handleCheckout
  };
};
