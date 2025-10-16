import { View, Text, TouchableOpacity } from 'react-native';

import { Category } from '@/types/userHome';

export interface CategoryCardProps {
  item: Category;
  onPress: (category: Category) => void;
}

export const CategoryCard = ({ item, onPress }: { item: Category; onPress: (category: Category) => void }) => (
  <TouchableOpacity 
    onPress={() => onPress(item)}
    className="bg-white rounded-2xl p-4 items-center shadow-sm mr-3"
    style={{ width: 100 }}
    activeOpacity={0.7}
  >
    <View className="w-16 h-16 rounded-full bg-gray-100 mb-3 items-center justify-center">
      <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
    </View>
    <Text className="text-gray-900 font-semibold text-sm text-center">{item.title}</Text>
  </TouchableOpacity>
);