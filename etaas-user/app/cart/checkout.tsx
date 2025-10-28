// app/cart/checkout.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CheckoutItem } from '@/types/cart/checkout';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Address {
  id: string;
  fullName: string;
  phoneNumber: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  streetAddress: string;
  isDefault: boolean;
}

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useCurrentUser();
  
  const items: CheckoutItem[] = JSON.parse(params.items as string);
  const sellerId = params.sellerId as string;
  const shopName = params.shopName as string;
  const totalAmount = parseFloat(params.totalAmount as string);
  const itemCount = parseInt(params.itemCount as string);

  useEffect(() => {
    if (!userData) return;

    const userRef = doc(db, 'users', userData.uid);

    // Listen for real-time updates to the default address
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          
          if (data.addressesList && Array.isArray(data.addressesList)) {
            const defaultAddress = data.addressesList.find(
              (addr: Address) => addr.isDefault === true
            );
            
            setSelectedAddress(defaultAddress || null);
          } else {
            setSelectedAddress(null);
          }
        } else {
          setSelectedAddress(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to address changes:', error);
        setLoading(false);
      }
    );

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [userData]);

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const shippingFee = 50;
  const serviceFee = 10;
  const totalPrice = calculateSubtotal() + shippingFee + serviceFee;

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      Alert.alert(
        'No Shipping Address',
        'Please add a shipping address before placing your order.',
        [{ text: 'Add Address', onPress: () => router.push('/address/new') }]
      );
      return;
    }

    // TODO: Implement order placement logic
    Alert.alert('Success', 'Order placed successfully!');
  };

  const handleAddressPress = () => {
    router.push('/address/list');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Checkout</Text>
            <Text className="text-xs text-gray-500 mt-0.5">{shopName}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Shipping Address Card */}
        <TouchableOpacity
          onPress={handleAddressPress}
          className="bg-white mx-4 mt-4 rounded-xl p-4 border border-gray-200"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-pink-100 rounded-full items-center justify-center mr-2">
                <Ionicons name="location" size={18} color="#EC4899" />
              </View>
              <Text className="text-base font-bold text-gray-900">Shipping Address</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#EC4899" />
          ) : selectedAddress ? (
            <View className="pl-10">
              <View className="flex-row items-center mb-1">
                <Text className="text-sm font-semibold text-gray-900 mr-2">
                  {selectedAddress.fullName}
                </Text>
                <View className="bg-pink-100 px-2 py-0.5 rounded">
                  <Text className="text-xs font-medium text-pink-600">Default</Text>
                </View>
              </View>
              <Text className="text-sm text-gray-600 mb-1">
                {selectedAddress.phoneNumber}
              </Text>
              <Text className="text-sm text-gray-700 leading-5">
                {selectedAddress.streetAddress}, {selectedAddress.barangay}, {selectedAddress.city}, {selectedAddress.province}, {selectedAddress.region}
              </Text>
            </View>
          ) : (
            <View className="pl-10">
              <Text className="text-sm text-gray-500 mb-2">
                You don't have a shipping address yet.
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="add-circle" size={16} color="#EC4899" />
                <Text className="text-sm font-semibold text-pink-500 ml-1">
                  Add shipping address
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Order Summary */}
        <View className="bg-white mx-4 mt-3 rounded-xl p-4 border border-gray-200">
          <Text className="text-base font-bold text-gray-900 mb-3">Order Summary</Text>
          
          {items.map((item, index) => (
            <View 
              key={`${item.productId}-${item.variantId || ''}`}
              className={`flex-row py-3 ${
                index < items.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                className="w-20 h-20 rounded-lg bg-gray-100"
                resizeMode="cover"
              />
              
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>
                  {item.productName}
                </Text>
                
                {item.variantText && (
                  <View className="bg-gray-100 self-start px-2 py-1 rounded mb-2">
                    <Text className="text-xs text-gray-600">{item.variantText}</Text>
                  </View>
                )}
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">x{item.quantity}</Text>
                  <Text className="text-base font-bold text-gray-900">
                    ₱{(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View className="bg-white mx-4 mt-3 mb-4 rounded-xl p-4 border border-gray-200">
          <Text className="text-base font-bold text-gray-900 mb-3">Payment Summary</Text>
          
          <View className="space-y-2">
            <View className="flex-row justify-between py-1.5">
              <Text className="text-sm text-gray-600">
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </Text>
              <Text className="text-sm text-gray-900">
                ₱{calculateSubtotal().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            
            <View className="flex-row justify-between py-1.5">
              <Text className="text-sm text-gray-600">Shipping Fee</Text>
              <Text className="text-sm text-gray-900">
                ₱{shippingFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            
            <View className="flex-row justify-between py-1.5">
              <Text className="text-sm text-gray-600">Service Fee</Text>
              <Text className="text-sm text-gray-900">
                ₱{serviceFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            
            <View className="h-px bg-gray-200 my-2" />
            
            <View className="flex-row justify-between items-center py-1">
              <Text className="text-base font-bold text-gray-900">Total Payment</Text>
              <Text className="text-xl font-bold text-pink-500">
                ₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="bg-white border-t border-gray-100 px-4 py-3">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs text-gray-500">Total Payment</Text>
            <Text className="text-lg font-bold text-pink-500">
              ₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePlaceOrder}
            className="bg-pink-500 px-8 py-3.5 rounded-xl shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">
              Place Order
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}