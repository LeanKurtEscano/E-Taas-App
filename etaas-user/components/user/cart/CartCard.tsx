// components/user/cart/CartCard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

interface CartItem {
  productId: string;
  hasVariants: boolean;
  variantId: string | null;
  quantity: number;
  sellerId: string;
  addedAt: any;
  updatedAt: any;
}

interface CartCardProps {
  sellerId: string;
  items: CartItem[];
  userId: string;
  onUpdate?: () => void;
}

interface Product {
  name: string;
  description: string;
  category: string;
  availability: string;
  hasVariants: boolean;
  price: number;
  quantity: number;
  images: string[];
  variants?: Variant[];
  variantCategories?: VariantCategory[];
}

interface Variant {
  id: string;
  combination: string[];
  price: number;
  stock: number;
  image: string;
}

interface VariantCategory {
  id: string;
  name: string;
  values: string[];
}

interface SellerInfo {
  shopName: string;
}

interface ProductData {
  product: Product;
  variant: Variant | null;
  price: number;
  stock: number;
  image: string;
  variantText: string;
}

export default function CartCard({ sellerId, items, userId, onUpdate }: CartCardProps) {
  const navigation = useNavigation();
  const [shopName, setShopName] = useState<string>('');
  const [productsData, setProductsData] = useState<Map<string, ProductData>>(new Map());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [sellerId, items]);

  const fetchData = async () => {
    try {
      // Fetch seller info
      const sellerDoc = await getDoc(doc(db, 'users', sellerId));
      if (sellerDoc.exists()) {
        const sellerData = sellerDoc.data() as { sellerInfo?: SellerInfo };
        setShopName(sellerData.sellerInfo?.shopName || 'Unknown Shop');
      }

      // Fetch all products
      const productsMap = new Map<string, ProductData>();
      
      for (const item of items) {
        const productDoc = await getDoc(doc(db, 'products', item.productId));
        
        if (productDoc.exists()) {
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
      }

      setProductsData(productsMap);
    } catch (error) {
      console.error('Error fetching cart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    const key = item.productId + (item.variantId || '');
    const data = productsData.get(key);
    
    if (!data) return;

    // Check stock availability
    if (newQuantity > data.stock) {
      Alert.alert('Stock Limit', `Only ${data.stock} items available in stock`);
      return;
    }

    if (newQuantity < 1) {
      // Remove item if quantity is 0
      handleDeleteItem(item);
      return;
    }

    setUpdating(key);

    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const cart = cartSnap.data();
        const updatedItems = cart.items.map((cartItem: CartItem) => {
          if (
            cartItem.productId === item.productId &&
            cartItem.variantId === item.variantId
          ) {
            return {
              ...cartItem,
              quantity: newQuantity,
              updatedAt: new Date()
            };
          }
          return cartItem;
        });

        await updateDoc(cartRef, { items: updatedItems });
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteItem = async (item: CartItem) => {
    const key = item.productId + (item.variantId || '');
    
    Alert.alert(
      'Remove Item',
      'Remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setUpdating(key);
            try {
              const cartRef = doc(db, 'carts', userId);
              const cartSnap = await getDoc(cartRef);

              if (cartSnap.exists()) {
                const cart = cartSnap.data();
                const updatedItems = cart.items.filter(
                  (cartItem: CartItem) =>
                    !(cartItem.productId === item.productId &&
                      cartItem.variantId === item.variantId)
                );

                await updateDoc(cartRef, { items: updatedItems });
                onUpdate?.();
              }
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to remove item');
            } finally {
              setUpdating(null);
            }
          }
        }
      ]
    );
  };

  const toggleItemSelection = (key: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
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

  const navigateToProduct = (productId: string) => {
    
  };

  const navigateToShop = () => {

  };

  const calculateShopTotal = () => {
    let total = 0;
    items.forEach(item => {
      const key = item.productId + (item.variantId || '');
      const data = productsData.get(key);
      if (data && selectedItems.has(key)) {
        total += data.price * item.quantity;
      }
    });
    return total;
  };

  if (loading) {
    return (
      <View className="bg-white rounded-2xl p-4 mx-4 mb-4 shadow-sm">
        <ActivityIndicator size="small" color="#EC4899" />
      </View>
    );
  }

  const shopTotal = calculateShopTotal();
  const allSelected = selectedItems.size === items.length && items.length > 0;

  return (
    <View className="bg-white rounded-2xl p-4 mx-4 mb-4 shadow-sm">
      {/* Shop Header */}
      <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={toggleSelectAll}
            className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
              allSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
            }`}
          >
            {allSelected && <Text className="text-white text-xs font-bold">✓</Text>}
          </TouchableOpacity>
          
          <View className="bg-pink-500 px-3 py-1 rounded-full mr-2">
            <Text className="text-white text-xs font-semibold">Shop</Text>
          </View>
          
          <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
            {shopName}
          </Text>
        </View>
        
        <TouchableOpacity onPress={navigateToShop}>
          <Text className="text-pink-500 font-medium">Visit</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      {items.map((item, index) => {
        const key = item.productId + (item.variantId || '');
        const data = productsData.get(key);
        const isSelected = selectedItems.has(key);
        const isUpdating = updating === key;

        if (!data) return null;

        const isLowStock = data.stock <= 10 && data.stock > 0;
        const isOutOfStock = data.stock === 0;
        const isUnavailable = data.product.availability !== 'available';
        const canIncrease = item.quantity < data.stock;

        return (
          <View
            key={key}
            className={`flex-row mb-4 pb-4 ${
              index < items.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            {/* Checkbox */}
            <TouchableOpacity
              onPress={() => toggleItemSelection(key)}
              disabled={isOutOfStock || isUnavailable}
              className={`w-6 h-6 rounded border-2 mr-3 mt-1 items-center justify-center ${
                isSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
              } ${(isOutOfStock || isUnavailable) && 'opacity-40'}`}
            >
              {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
            </TouchableOpacity>

            {/* Product Image with Stock Badge */}
            <TouchableOpacity
              onPress={() => navigateToProduct(item.productId)}
              activeOpacity={0.7}
            >
              <View className="relative">
                <Image
                  source={{ uri: data.image || 'https://via.placeholder.com/80' }}
                  className="w-20 h-20 rounded-lg bg-gray-100"
                  resizeMode="cover"
                />
                
                {/* Low Stock Badge */}
                {isLowStock && (
                  <View className="absolute bottom-0 left-0 right-0 bg-orange-500 rounded-b-lg py-1">
                    <Text className="text-white text-[10px] font-bold text-center">
                      {data.stock} left
                    </Text>
                  </View>
                )}
                
                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <View className="absolute inset-0 bg-black/60 rounded-lg items-center justify-center">
                    <Text className="text-white text-xs font-bold">Out of Stock</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Product Details */}
            <View className="flex-1 ml-3">
              {/* Product Name */}
              <TouchableOpacity
                onPress={() => navigateToProduct(item.productId)}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-gray-800 mb-1" numberOfLines={2}>
                  {data.product.name}
                </Text>
              </TouchableOpacity>

              {/* Variant Info */}
              {data.variantText && (
                <View className="bg-gray-100 px-2 py-1 rounded mb-2 self-start">
                  <Text className="text-xs text-gray-600">{data.variantText}</Text>
                </View>
              )}

              {/* Availability Warning */}
              {isUnavailable && (
                <Text className="text-xs text-red-500 mb-1">⚠️ Currently unavailable</Text>
              )}

              {/* Price and Quantity */}
              <View className="flex-row items-center justify-between mt-auto">
                <Text className="text-lg font-bold text-pink-500">
                  ₱{data.price.toLocaleString()}
                </Text>

                {/* Quantity Controls */}
                <View className="flex-row items-center bg-gray-100 rounded-full px-1">
                  <TouchableOpacity
                    onPress={() => updateQuantity(item, item.quantity - 1)}
                    disabled={isUpdating}
                    className="w-7 h-7 items-center justify-center"
                  >
                    <Text className="text-gray-600 text-lg font-bold">−</Text>
                  </TouchableOpacity>
                  
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#EC4899" className="mx-3" />
                  ) : (
                    <Text className="mx-3 text-sm font-semibold text-gray-800 min-w-[20px] text-center">
                      {item.quantity}
                    </Text>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => updateQuantity(item, item.quantity + 1)}
                    disabled={!canIncrease || isUpdating}
                    className="w-7 h-7 items-center justify-center"
                  >
                    <Text className={`text-lg font-bold ${
                      !canIncrease ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stock Warning Message */}
              {item.quantity >= data.stock && data.stock > 0 && (
                <Text className="text-xs text-orange-500 mt-1">
                  Maximum quantity reached
                </Text>
              )}

              {/* Delete Button */}
              <TouchableOpacity
                onPress={() => handleDeleteItem(item)}
                className="mt-2 self-start"
              >
                <Text className="text-xs text-gray-400">🗑️ Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Shop Total & Voucher Section */}
      <View className="pt-3 border-t border-gray-100">
        {shopTotal > 0 && (
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600">Shop Subtotal ({selectedItems.size} items):</Text>
            <Text className="text-base font-bold text-pink-500">
              ₱{shopTotal.toLocaleString()}
            </Text>
          </View>
        )}
        
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-pink-500 text-xs mr-1">🎁</Text>
          <Text className="text-pink-500 text-xs font-medium">Add shop voucher code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}