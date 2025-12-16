import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Grid, Plus, Package } from 'lucide-react-native';
import { router } from 'expo-router';

interface EmptyStateProps {
  isOwner?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isOwner }) => {
  if (isOwner) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-12">
        <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
          <Grid size={40} color="#9CA3AF" />
        </View>
        
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          No Products Yet
        </Text>
        
        <Text className="text-gray-500 text-center mb-6">
          Start adding products to showcase your items to potential buyers
        </Text>
        
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-lg flex-row items-center"
          onPress={() => router.push('/seller/product')}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">
            Add First Product
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Not owner - browsing view
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Package size={40} color="#9CA3AF" />
      </View>
      
      <Text className="text-xl font-semibold text-gray-900 mb-2">
        No Products Available
      </Text>
      
      <Text className="text-gray-500 text-center">
        There are no products in this category yet. Check back later!
      </Text>
    </View>
  );
};