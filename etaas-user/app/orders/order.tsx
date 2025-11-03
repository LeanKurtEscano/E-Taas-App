import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import CheckoutToast from '@/components/general/CheckOutToast';
import { getStatusColor } from '@/utils/general/getStatus';
import { formatDate } from '@/utils/general/formatDate';

import { getStatusIcon } from '@/utils/general/getStatus';

import useOrder from '@/hooks/general/useOrder';

export default function MyOrdersScreen() {
  const {
    orders, loading,
    selectedTab, setSelectedTab,
    tabs, getTabIcon, 
    handleCancelOrder, toastVisible, toastMessage, toastType, 
    setToastVisible
  } = useOrder();
  
  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedTab); 


  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-5 py-4 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">My Orders</Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EC4899" />
          <Text className="text-gray-500 mt-4 text-base">Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/profile')}
            className="w-10 h-10 items-center justify-center -ml-2 mr-2"
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">My Orders</Text>
        </View>
      </View>

      {/* Enhanced Status Tabs */}
      <View className="bg-white border-b border-gray-100 px-3 py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, gap: 10 }}
        >
          {tabs.map((tab) => {
            const isSelected = selectedTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setSelectedTab(tab.key as any)}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-3 rounded-xl ${
                  isSelected ? 'bg-pink-500' : 'bg-gray-100'
                }`}
                style={isSelected ? {
                  shadowColor: '#EC4899',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 3,
                } : undefined}
              >
                <Ionicons 
                  name={getTabIcon(tab.key) as any} 
                  size={18} 
                  color={isSelected ? '#FFFFFF' : '#6B7280'} 
                />
                <Text className={`ml-2 font-semibold text-sm ${
                  isSelected ? 'text-white' : 'text-gray-700'
                }`}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View className={`ml-2 px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/25' : 'bg-pink-500'
                  }`}>
                    <Text className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-white'
                    }`}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.length === 0 ? (
          <View className="flex-1 justify-center items-center py-24 px-6">
            <View className="w-28 h-28 bg-gray-100 rounded-full items-center justify-center mb-5">
              <Ionicons name="receipt-outline" size={56} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</Text>
            <Text className="text-base text-gray-500 text-center leading-6 mb-1">
              {selectedTab === 'all' 
                ? "You haven't placed any orders yet."
                : `No ${selectedTab} orders found.`
              }
            </Text>
            <Text className="text-sm text-gray-400 text-center mb-8">
              {selectedTab === 'all' 
                ? "Start shopping to see your orders here"
                : "Try checking another status tab"
              }
            </Text>
            {selectedTab === 'all' && (
              <TouchableOpacity
                onPress={() => router.push('/(tabs)')}
                className="bg-pink-500 px-8 py-3.5 rounded-xl shadow-sm"
                activeOpacity={0.8}
                style={{
                  shadowColor: '#EC4899',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-white font-bold text-base">Start Shopping</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="px-5 pt-4 pb-6">
            {filteredOrders.map((order) => (
              <View 
                key={order.id}
                className="bg-white rounded-2xl mb-4 overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                {/* Order Header */}
                <View className="bg-gray-50 px-4 py-4">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center flex-1 mr-3">
                      <View className="w-8 h-8 bg-pink-100 rounded-full items-center justify-center">
                        <Ionicons name="storefront" size={16} color="#EC4899" />
                      </View>
                      <Text className="text-base font-bold text-gray-900 ml-3 flex-1" numberOfLines={1}>
                        {order.shopName}
                      </Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-full ${getStatusColor(order.status)}`}>
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={getStatusIcon(order.status) as any} 
                          size={13} 
                          color="currentColor" 
                        />
                        <Text className="text-xs font-bold ml-1.5 capitalize">
                          {order.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500 ml-1.5">
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Order Items */}
                <View className="px-4 py-3">
                  {order.items.map((item, index) => (
                    <View 
                      key={`${item.productId}-${index}`}
                      className={`flex-row py-3 ${
                        index < order.items.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <View 
                        className="rounded-xl overflow-hidden bg-gray-100"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Image
                          source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                          className="w-20 h-20"
                          resizeMode="cover"
                        />
                      </View>
                      
                      <View className="flex-1 ml-3.5 justify-between">
                        <View>
                          <Text className="text-sm font-semibold text-gray-900 mb-1.5 leading-5" numberOfLines={2}>
                            {item.productName}
                          </Text>
                          
                          {item.variantText && (
                            <View className="bg-gray-100 self-start px-2.5 py-1 rounded-md">
                              <Text className="text-xs text-gray-600 font-medium">{item.variantText}</Text>
                            </View>
                          )}
                        </View>
                        
                        <View className="flex-row justify-between items-center mt-2">
                          <Text className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</Text>
                          <Text className="text-base font-bold text-gray-900">
                            ₱{(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Order Footer */}
                <View className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-sm text-gray-500">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-sm text-gray-500 mr-2">Total:</Text>
                      <Text className="text-lg font-bold text-pink-600">
                        ₱{order.totalPayment.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => router.push('/(tabs)')}
                      className="flex-1 bg-white border-2 border-gray-200 py-3 rounded-xl"
                      activeOpacity={0.7}
                    >
                      <Text className="text-center text-sm font-bold text-gray-700">
                        View Details
                      </Text>
                    </TouchableOpacity>
                    
                    {order.status === 'pending' && (
                      <TouchableOpacity
                        onPress={() => handleCancelOrder(order.id, order.sellerId)}
                        className="flex-1 bg-red-500 py-3 rounded-xl"
                        activeOpacity={0.7}
                        style={{
                          shadowColor: '#EF4444',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 3,
                          elevation: 2,
                        }}
                      >
                        <Text className="text-center text-sm font-bold text-white">
                          Cancel Order
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {order.status === 'delivered' && (
                      <TouchableOpacity
                        onPress={() => {/* Navigate to review */}}
                        className="flex-1 bg-pink-500 py-3 rounded-xl"
                        activeOpacity={0.7}
                        style={{
                          shadowColor: '#EC4899',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 3,
                          elevation: 2,
                        }}
                      >
                        <Text className="text-center text-sm font-bold text-white">
                          Rate & Review
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Toast Notification */}
      <CheckoutToast
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        message={toastMessage}
        type={toastType}
      />
    </SafeAreaView>
  );
}