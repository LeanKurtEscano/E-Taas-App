import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Grid, Plus } from 'lucide-react-native';

interface EmptyStateProps {
  onAddProduct: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAddProduct }) => {
  return (
    <View className="flex-1 items-center justify-center py-20 px-6">
      <View className="bg-pink-100 rounded-full p-6 mb-4">
        <Grid size={48} color="#E91E8C" />
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2">
        No Products Yet
      </Text>
      <Text className="text-gray-600 text-center mb-6">
        Start adding products to showcase your items to potential buyers
      </Text>
      <TouchableOpacity 
        className="bg-pink-500 py-3 px-6 rounded-lg flex-row items-center"
        onPress={onAddProduct}
      >
        <Plus size={20} color="white" />
        <Text className="text-white font-semibold ml-2">Add First Product</Text>
      </TouchableOpacity>
    </View>
  );
};