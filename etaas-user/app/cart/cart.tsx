// screens/CartProductScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNavigation } from '@react-navigation/native';
import CartCard from '@/components/user/cart/CartCard';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CartItem {
  productId: string;
  hasVariants: boolean;
  variantId: string | null;
  quantity: number;
  sellerId: string;
  addedAt: any;
  updatedAt: any;
}

interface Cart {
  items: CartItem[];
}

interface GroupedCart {
  [sellerId: string]: CartItem[];
}

export default function CartProductScreen() {
  const { userData } = useCurrentUser();
  const navigation = useNavigation();
  const [cartData, setCartData] = useState<GroupedCart>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartData();
  }, [userData]);

  const fetchCartData = async () => {
    if (!userData?.uid) return;

    try {
      const cartRef = doc(db, 'carts', userData.uid);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        const cart = cartSnap.data() as Cart;
        const grouped = groupBySeller(cart.items);
        setCartData(grouped);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </TouchableOpacity>
      
      <ScrollView className="flex-1">
        {Object.entries(cartData).map(([sellerId, items]) => (
          <CartCard key={sellerId} sellerId={sellerId} items={items} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}