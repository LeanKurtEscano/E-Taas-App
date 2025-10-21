// components/EmptyState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';

const EmptyState: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-8 py-20">
      <View className="bg-pink-50 rounded-full w-32 h-32 items-center justify-center mb-6">
        <View className="bg-pink-100 rounded-full w-24 h-24 items-center justify-center">
          <ShoppingBag size={48} color="#EC4899" strokeWidth={2} />
        </View>
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
        No Products Available
      </Text>
      <Text className="text-base text-gray-500 text-center leading-relaxed max-w-sm">
        Our marketplace is just getting started. Check back soon as sellers begin listing their amazing products!
      </Text>
    </View>
  );
};

export default EmptyState;