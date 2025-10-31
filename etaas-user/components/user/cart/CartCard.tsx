// components/user/cart/CartCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartCardProps } from '@/types/product/product';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { CartSkeleton } from '@/components/loader/CartSkeleton';
import { useCartCard } from '@/hooks/general/useCartCard';

export default function CartCard({ sellerId, items, userId, onUpdate }: CartCardProps) {
  const {
    shopName,
    productsData,
    selectedItems,
    hasSelectedItems,
    loading,
    handleCheckout,
    handleIncrement,
    handleDecrement,
    handleDeleteItem,
    toggleItemSelection,
    toggleSelectAll,
    localQuantities,
    allSelected,
    updatingQuantity,
    shopTotal,
    isStockLow
  } = useCartCard(userId, sellerId, items, onUpdate);


  if (loading) {
    return (
      <>
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
      </>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 mx-4 mb-4 shadow-sm">
      {/* Shop Header */}
      <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <View className="flex-row flex-1">
          <TouchableOpacity
            onPress={toggleSelectAll}
            className={`w-6 h-6 rounded-md border-2 mr-2 items-center justify-center ${allSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
              }`}
            activeOpacity={0.7}
          >
            {allSelected && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>

          <View className="bg-gradient-to-r from-pink-500 to-pink-600 px-3 py-1.5 rounded-lg mr-2">
            <Ionicons name="storefront" size={12} color="white" />
          </View>

          <View className="bg-pink-500 px-3 py-1 rounded-full mr-2">
            <Text className="text-white text-xs font-semibold">Shop</Text>
          </View>

          <Text className="text-base font-bold text-gray-800 flex-1" numberOfLines={1}>
            {shopName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/shop/${sellerId}`)}
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <Text className="text-pink-500 font-semibold text-sm mr-1">Visit</Text>
          <Ionicons name="chevron-forward" size={16} color="#EC4899" />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      {items.map((item, index) => {
        const key = item.productId + (item.variantId || '');
        const data = productsData.get(key);
        const isSelected = selectedItems.has(key);
        const isUpdating = updatingQuantity === key;

        // Use local quantity for display
        const displayQuantity = localQuantities.get(key) || item.quantity;


        const totalPrice = data ? data.price * displayQuantity : 0;

        if (!data) return null;

        const isLowStock = data.stock <= 10 && data.stock > 0;
        const isOutOfStock = data.stock === 0;
        const isUnavailable = data.product.availability !== 'available';
        const canIncrease = displayQuantity < data.stock;
        const canDecrease = displayQuantity > 1;

        return (
          <View
            key={key}
            className={`mb-4 pb-4 ${index < items.length - 1 ? 'border-b border-gray-100' : ''
              }`}
          >
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => toggleItemSelection(key)}
                disabled={isOutOfStock || isUnavailable}
                className={`w-6 h-6 rounded-md border-2 mr-3 mt-1 items-center justify-center ${isSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
                  } ${(isOutOfStock || isUnavailable) && 'opacity-40'}`}
                activeOpacity={0.7}
              >
                {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push(`/product/${item.productId}`)}
                activeOpacity={0.7}
              >
                <View className="relative">
                  <Image
                    source={{ uri: data.image || 'https://via.placeholder.com/90' }}
                    className="w-[90px] h-[90px] rounded-xl bg-gray-100"
                    resizeMode="cover"
                  />

                  {isLowStock && (
                    <View className="absolute bottom-0 left-0 right-0 bg-pink-500 rounded-b-xl py-1">
                      <Text className="text-white text-[10px] font-bold text-center">
                        Only {data.stock} left
                      </Text>
                    </View>
                  )}

                  {isOutOfStock && (
                    <View className="absolute inset-0 bg-black/70 rounded-xl items-center justify-center">
                      <Ionicons name="close-circle" size={24} color="white" />
                      <Text className="text-white text-[10px] font-bold mt-1">Out of Stock</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <View className="flex-1 ml-3">
                <View className="flex-row justify-between items-start mb-2">
                  <TouchableOpacity
                    onPress={() => router.push(`/product/${item.productId}`)}
                    activeOpacity={0.7}
                    className="flex-1 mr-2"
                  >
                    <Text className="text-sm font-semibold text-gray-800" numberOfLines={2}>
                      {data.product.name}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item)}
                    className="p-1 -mt-1 -mr-1"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {data.variantText && (
                  <View className="bg-pink-50 px-2.5 py-1.5 rounded-lg mb-2 self-start">
                    <Text className="text-xs text-pink-700 font-medium">{data.variantText}</Text>
                  </View>
                )}

                {isUnavailable && (
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <Text className="text-xs text-red-500 ml-1 font-medium">Currently unavailable</Text>
                  </View>
                )}

                <Text className="text-lg font-bold text-pink-500 mb-3">
                  ₱{totalPrice.toLocaleString()}
                </Text>

                <View className="flex-row items-center">
                  <View className="flex-row items-center bg-gray-100 rounded-full">
                    <TouchableOpacity
                      onPress={() => handleDecrement(item)}
                      disabled={isUpdating || isOutOfStock || isUnavailable}
                      className={`w-8 h-8 items-center justify-center rounded-l-full ${isUpdating ? 'opacity-40' : ''
                        }`}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={isUpdating ? '#9CA3AF' : '#4B5563'}
                      />
                    </TouchableOpacity>

                    {isUpdating ? (
                      <View className="mx-4 min-w-[30px] items-center">
                        <ActivityIndicator size="small" color="#EC4899" />
                      </View>
                    ) : (
                      <Text className="mx-4 text-sm font-bold text-gray-800 min-w-[30px] text-center">
                        {displayQuantity}
                      </Text>
                    )}

                    <TouchableOpacity
                      onPress={() => handleIncrement(item)}
                      disabled={!canIncrease || isUpdating || isOutOfStock || isUnavailable}
                      className={`w-8 h-8 items-center justify-center rounded-r-full ${!canIncrease || isUpdating ? 'opacity-40' : ''
                        }`}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={!canIncrease || isUpdating ? '#9CA3AF' : '#4B5563'}
                      />
                    </TouchableOpacity>
                  </View>

                  {displayQuantity >= data.stock && data.stock > 0 && (
                    <View className="flex-row items-center ml-3">
                      <Ionicons name="information-circle" size={14} color="#F59E0B" />
                      <Text className="text-xs text-pink-500 ml-1 font-medium">
                        Max reached
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        );
      })}

      {/* Shop Total */}


      {/* Shop Total & Checkout Button */}
      <View className="pt-4 border-t border-gray-100">
        {hasSelectedItems && (
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm text-gray-600">
                Shop Subtotal ({selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'}):
              </Text>
              <Text className="text-xl font-bold text-pink-500">
                ₱{shopTotal.toLocaleString()}
              </Text>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              onPress={handleCheckout}
              className={`py-4 rounded-xl shadow-sm ${isStockLow ? 'bg-gray-400' : 'bg-pink-500'
                }`}
              disabled={isStockLow}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-center text-base">
                {isStockLow
                  ? 'Cart exceeds stock — deduct quantities'
                  : `Checkout (${selectedItems.size} ${selectedItems.size === 1 ? 'item' : 'items'
                  })`}
              </Text>

              {!isStockLow && (
                <Text className="text-white text-center text-sm mt-1">
                  Total: ₱{shopTotal.toLocaleString()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {!hasSelectedItems && shopTotal > 0 && (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">
              Select items to checkout
            </Text>
            <Text className="text-lg font-semibold text-gray-500">
              ₱{shopTotal.toLocaleString()}
            </Text>
          </View>
        )}
      </View>


    </View>
  );
}