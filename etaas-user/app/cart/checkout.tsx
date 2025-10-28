// app/checkout.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CheckoutItem } from '@/types/cart/checkout';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  
  const items: CheckoutItem[] = JSON.parse(params.items as string);
  const sellerId = params.sellerId as string;
  const shopName = params.shopName as string;
  const totalAmount = parseFloat(params.totalAmount as string);
  const itemCount = parseInt(params.itemCount as string);

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = () => {
  
    
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full mr-4"
          >
            <Ionicons name="arrow-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-800">Checkout</Text>
            <Text className="text-sm text-gray-500 mt-0.5">{shopName}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Order Summary</Text>
          
          {items.map((item, index) => (
            <View 
              key={`${item.productId}-${item.variantId || ''}`}
              className={`flex-row mb-4 pb-4 ${
                index < items.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                className="w-16 h-16 rounded-lg bg-gray-100"
                resizeMode="cover"
              />
              
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-gray-800 mb-1" numberOfLines={2}>
                  {item.productName}
                </Text>
                
                {item.variantText && (
                  <Text className="text-xs text-gray-500 mb-1">{item.variantText}</Text>
                )}
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">Qty: {item.quantity}</Text>
                  <Text className="text-base font-bold text-pink-500">
                    ₱{(item.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Price Details</Text>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal ({itemCount} items)</Text>
              <Text className="text-gray-800">₱{calculateSubtotal().toLocaleString()}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Shipping Fee</Text>
              <Text className="text-gray-800">₱50.00</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Service Fee</Text>
              <Text className="text-gray-800">₱10.00</Text>
            </View>
            
            <View className="h-px bg-gray-200 my-2" />
            
            <View className="flex-row justify-between">
              <Text className="text-lg font-bold text-gray-800">Total</Text>
              <Text className="text-lg font-bold text-pink-500">
                ₱{(calculateSubtotal() + 60).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          className="bg-pink-500 py-4 rounded-xl shadow-sm"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-center text-base">
            Place Order
          </Text>
          <Text className="text-white text-center text-sm mt-1">
            ₱{(calculateSubtotal() + 60).toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}