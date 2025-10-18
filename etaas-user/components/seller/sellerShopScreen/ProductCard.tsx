import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Product, ViewMode } from '@/types/seller/shop';
import { Pencil } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
  viewMode: ViewMode;
  onPress: () => void;
  onEdit: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  onPress,
  onEdit,
}) => {
  const statusColors = {
    available: 'bg-green-500',
    sold: 'bg-gray-500',
    reserved: 'bg-yellow-500',
  };

  if (viewMode === 'list') {
    return (
      <TouchableOpacity 
        className="bg-white flex-row p-3 border-b border-gray-100"
        onPress={onPress}
      >
        <Image 
          source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }}
          className="w-24 h-24 rounded-lg"
          resizeMode="cover"
        />
        <View className="flex-1 ml-3 justify-between">
          <View>
            <Text className="text-gray-900 font-semibold" numberOfLines={2}>
              {product.name}
            </Text>
            <Text className="text-gray-600 text-sm mt-1">{product.category}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-pink-500 font-bold text-lg">
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
         <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="bg-pink-500 px-3 py-2 rounded-lg flex-row items-center gap-1"
              >
                <Pencil size={14} color="#FFFFFF" />
                <Text className="text-white text-xs font-semibold">Edit Product</Text>
              </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      className="bg-white rounded-lg overflow-hidden border border-gray-200 mb-3"
      onPress={onPress}
      style={{ width: '48%' }}
    >
      <View className="relative">
        <Image 
          source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }}
          className="w-full h-40"
          resizeMode="cover"
        />
        <View className={`absolute top-2 left-2 ${statusColors[product.availability]} px-2 py-1 rounded`}>
          <Text className="text-white text-xs font-medium capitalize">
            {product.availability}
          </Text>
        </View>
       
      </View>
      <View className="p-3">
        <Text className="text-gray-900 font-semibold" numberOfLines={2}>
          {product.name}
        </Text>
        <Text className="text-gray-600 text-xs mt-1">{product.category}</Text>
        <Text className="text-pink-500 font-bold text-lg mt-2">
          ₱{product.price.toLocaleString()}
        </Text>
      </View>
       <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute bottom-2 right-2 bg-pink-500 px-3 py-2 rounded-lg flex-row items-center gap-1 "
        >
          <Pencil size={14} color="#FFFFFF" />
          <Text className="text-white text-xs font-semibold">Edit</Text>
        </TouchableOpacity>
    </TouchableOpacity>
  );
};