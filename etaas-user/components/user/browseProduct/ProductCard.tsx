// components/ProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Star } from 'lucide-react-native';
import { Product } from '@/types/seller/shop';
import { router } from 'expo-router';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {


  const isAvailable = product.availability === 'available' ;
  const isOutOfStock = product.hasVariants  ? product.variants!.every(v => v.stock === 0) : product.quantity === 0;

  const isNewProduct = (() => {
    if (!product.createdAt) return false;

    const createdAtDate =
      typeof product.createdAt === 'string'
        ? new Date(product.createdAt)
        : product.createdAt.toDate
        ? product.createdAt.toDate()
        : new Date(product.createdAt);

    const now = new Date();
    const diffInDays =
      (now.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24);

    return diffInDays <= 7;
  })();

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
      }}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.8}
    >
      <View className="w-full aspect-square relative bg-gray-100">
        <Image
          source={{ uri: product.images[0] }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Availability Badge */}
        {isOutOfStock && (
          <View className="absolute inset-0 bg-black/70 justify-center items-center">
            <View className="bg-white/95 px-4 py-2 rounded-full">
              <Text className="text-gray-900 text-xs font-bold">OUT OF STOCK</Text>
            </View>
          </View>
        )}

        {/* 🆕 New Product Badge */}
        {isNewProduct && isAvailable && (
          <View className="absolute top-2 right-2 bg-pink-600 px-2.5 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">NEW</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        {/* Category */}
        <Text className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">
          {product.category}
        </Text>

        {/* Product Name */}
        <Text
          className="text-sm font-bold text-gray-900 mb-2 leading-tight"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Rating & Reviews */}
        <View className="flex-row items-center mb-2">
          <Star size={12} color="#FBBF24" fill="#FBBF24" />
          <Text className="text-xs text-gray-600 ml-1 font-semibold">4.5</Text>
          <Text className="text-xs text-gray-400 ml-1">(127)</Text>
        </View>

        {/* Price */}
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-pink-600">
            ₱{product.price.toLocaleString()}
          </Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100">
          <MapPin size={12} color="#9CA3AF" />
          <Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>
            Santa Cruz, Laguna
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
