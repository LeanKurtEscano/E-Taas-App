import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="bg-white border-b border-gray-200"
    >
      <View className="flex-row px-4 py-3">
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category}
            onPress={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === category 
                ? 'bg-pink-500' 
                : 'bg-gray-100'
            } ${index > 0 ? 'ml-2' : ''}`}
          >
            <Text 
              className={`font-medium ${
                selectedCategory === category 
                  ? 'text-white' 
                  : 'text-gray-700'
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};