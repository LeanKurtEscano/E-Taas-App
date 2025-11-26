// screens/CartProductScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import CartCard from '@/components/user/cart/CartCard';
import { CartSkeleton } from '@/components/loader/CartSkeleton';

interface Cart {
  items: CartItem[];
}

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  sellerId: string;
  hasVariants: boolean;
  addedAt: any;
  updatedAt?: any;
}

interface GroupedCart {
  [sellerId: string]: CartItem[];
}

export default function CartProductScreen() {
  const { userData } = useCurrentUser();
  const navigation = useNavigation();
  const [cartData, setCartData] = useState<GroupedCart>({});
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchCartData();
  }, [userData]);

  const fetchCartData = async (silent: boolean = false) => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    try {
      // Only show loading skeleton on initial load
      if (!silent) {
        setLoading(true);
      }
      
      const cartRef = doc(db, 'carts', userData.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const cart = cartSnap.data() as Cart;
        const grouped = groupBySeller(cart.items);
        setCartData(grouped);
      } else {
        setCartData({});
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Silent refresh function for quantity updates
  const handleSilentUpdate = () => {
    fetchCartData(true);
  };

  const groupBySeller = (items: CartItem[]): GroupedCart => {
    return items.reduce((acc, item) => {
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = [];
      }
      acc[item.sellerId].push(item);
      return acc;
    }, {} as GroupedCart);
  };

  const calculateTotals = () => {
    let items = 0;
    Object.values(cartData).forEach((sellerItems) => {
      sellerItems.forEach(item => {
        items += item.quantity;
      });
    });
    setTotalItems(items);
  };

  useEffect(() => {
    calculateTotals();
  }, [cartData]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header Skeleton */}
        <View className="bg-white px-4 py-4 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-200 rounded-full" />
            <View className="flex-1 ml-4 h-6 bg-gray-200 rounded" />
          </View>
        </View>
        
        <ScrollView className="flex-1 pt-4">
          <CartSkeleton />
          <CartSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const hasItems = Object.keys(cartData).length > 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Enhanced Header */}
      <View className="bg-white px-4 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full mr-4"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="#1F2937" />
            </TouchableOpacity>
            
            <View>
              <Text className="text-2xl font-bold text-gray-800">My Cart</Text>
              {totalItems > 0 && (
                <Text className="text-sm text-gray-500 mt-0.5">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Text>
              )}
            </View>
          </View>

          {totalItems > 0 && (
            <View className="bg-pink-500 px-3 py-1.5 rounded-full">
              <Text className="text-white text-xs font-bold">{totalItems}</Text>
            </View>
          )}
        </View>
      </View>

      {!hasItems ? (
        // Empty Cart State
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-32 h-32 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</Text>
          <Text className="text-gray-500 text-center mb-8">
            Looks like you haven't added anything to your cart yet
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)')}
            className="bg-pink-500 px-8 py-4 rounded-xl shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
          {Object.entries(cartData).map(([sellerId, items]) => (
            <CartCard 
              key={sellerId} 
              sellerId={sellerId} 
              items={items}
              userId={userData?.uid || ''}
              onUpdate={handleSilentUpdate}
            />
          ))}
          <View className="h-32" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}