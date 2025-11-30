// components/seller/sellerShopScreen/ProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Product, ViewMode } from '@/types/seller/shop';
import { Pencil, Package } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
  viewMode: ViewMode;
  onPress: () => void;
  onEdit?: () => void;
  isOwner?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  onPress,
  onEdit,
  isOwner = false,
}) => {
  const statusColors = {
    available: 'bg-green-500',
    sold: 'bg-gray-500',
    reserved: 'bg-yellow-500',
  };

  const isOutOfStock = product.availability === 'out of stock';

  if (viewMode === 'list') {
    return (
      <TouchableOpacity 
        className="bg-white flex-row p-3 border-b border-gray-100"
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Image with Out of Stock Overlay */}
        <View className="relative">
          <Image 
            source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }}
            className="w-24 h-24 rounded-lg"
            resizeMode="cover"
            style={{ opacity: isOutOfStock ? 0.5 : 1 }}
          />
          {isOutOfStock && (
            <View className="absolute inset-0 items-center justify-center bg-black/40 rounded-lg">
              <Package size={24} color="#FFFFFF" />
              <Text className="text-white text-xs font-bold mt-1">SOLD OUT</Text>
            </View>
          )}
        </View>

        <View className="flex-1 ml-3 justify-between">
          <View>
            <Text 
              className="text-gray-900 font-semibold" 
              numberOfLines={2}
              style={{ opacity: isOutOfStock ? 0.6 : 1 }}
            >
              {product.name}
            </Text>
            <Text className="text-gray-600 text-sm mt-1">{product.category}</Text>
          </View>
          
          <View className="flex-row items-center justify-between">
            <Text 
              className="text-pink-500 font-bold text-lg"
              style={{ opacity: isOutOfStock ? 0.6 : 1 }}
            >
              ₱{product.price.toLocaleString()}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className={`${statusColors[product.availability]} px-2 py-1 rounded`}>
                <Text className="text-white text-xs font-medium capitalize">
                  {product.availability}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Button - Only for Owner */}
        {isOwner && onEdit && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="ml-2 bg-pink-500 px-3 py-2 rounded-lg self-center"
          >
            <Pencil size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  // Grid View
  return (
    <TouchableOpacity 
      className="bg-white rounded-lg overflow-hidden border border-gray-200 mb-3"
      onPress={onPress}
      style={{ width: '48%' }}
      activeOpacity={0.7}
    >
      {/* Image with Status Badge */}
      <View className="relative">
        <Image 
          source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }}
          className="w-full h-40"
          resizeMode="cover"
          style={{ opacity: isOutOfStock ? 0.5 : 1 }}
        />
        
        {/* Status Badge */}
        <View className={`absolute top-2 left-2 ${statusColors[product.availability]} px-2 py-1 rounded`}>
          <Text className="text-white text-xs font-medium capitalize">
            {product.availability}
          </Text>
        </View>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View className="absolute inset-0 items-center justify-center bg-black/40">
            <Package size={32} color="#FFFFFF" />
            <Text className="text-white text-sm font-bold mt-2">SOLD OUT</Text>
          </View>
        )}

        {/* Edit Button (Top Right) - Only for Owner */}
        {isOwner && onEdit && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-2 right-2 bg-pink-500 p-2 rounded-full shadow-lg"
          >
            <Pencil size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Product Info */}
      <View className="p-3">
        <Text 
          className="text-gray-900 font-semibold" 
          numberOfLines={2}
          style={{ opacity: isOutOfStock ? 0.6 : 1 }}
        >
          {product.name}
        </Text>
        <Text className="text-gray-600 text-xs mt-1">{product.category}</Text>
        <Text 
          className="text-pink-500 font-bold text-lg mt-2"
          style={{ opacity: isOutOfStock ? 0.6 : 1 }}
        >
          ₱{product.price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};