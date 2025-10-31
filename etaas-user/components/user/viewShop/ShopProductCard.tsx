// components/shop/ShopProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  hasVariants: boolean;
  variants?: Array<{
    id: string;
    price: number;
    stock: number;
  }>;
  quantity: number;
}

interface ShopProductCardProps {
  product: Product;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export const ShopProductCard: React.FC<ShopProductCardProps> = ({ product }) => {
  const getPrice = () => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const prices = product.variants.map(v => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return `₱${minPrice.toFixed(2)}`;
      }
      return `₱${minPrice.toFixed(2)} - ₱${maxPrice.toFixed(2)}`;
    }
    return `₱${product.price.toFixed(2)}`;
  };

  const getStock = () => {
    if (product.hasVariants && product.variants) {
      return product.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return product.quantity;
  };

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="bg-white rounded-xl mb-4 overflow-hidden border border-gray-300"
      style={{ width: CARD_WIDTH }}
    >
      
      <View className="relative">
        <Image
          source={{ uri: product.images[0] }}
          className="w-full bg-gray-100"
          style={{ height: CARD_WIDTH }}
          resizeMode="cover"
        />
   
        <TouchableOpacity
          className="absolute top-2 right-2 bg-white/90 rounded-full p-2"
          onPress={(e) => {
            e.stopPropagation();
          
          }}
        >
          <Heart size={18} color="#ec4899" fill="transparent" />
        </TouchableOpacity>

 
        {getStock() <= 5 && getStock() > 0 && (
          <View className="absolute bottom-2 left-2 bg-pink-500 px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-semibold">
              Only {getStock()} left
            </Text>
          </View>
        )}

        {getStock() === 0 && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <View className="bg-gray-800 px-3 py-1.5 rounded-md">
              <Text className="text-white text-sm font-bold">Out of Stock</Text>
            </View>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="p-3">
        <Text
          className="text-gray-900 font-semibold text-sm mb-1"
          numberOfLines={2}
        >
          {product.name}
        </Text>
        
        <Text className="text-pink-500 font-bold text-base mb-1">
          {getPrice()}
        </Text>

        {product.hasVariants && (
          <View className="bg-pink-50 px-2 py-1 rounded-md self-start">
            <Text className="text-pink-600 text-xs font-medium">
              {product.variants?.length} variants
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};