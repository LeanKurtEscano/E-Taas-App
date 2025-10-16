import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { SearchBar } from '../userHomeScreen/SearchBar';

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  cartCount: number;
  onCartPress: () => void;
  showSearch?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartCount,
  onCartPress,
  showSearch = true,
}) => {
  return (
    <View className="bg-white pt-4 pb-9 px-5">
      <View className="flex-row items-center justify-between">
        {/* Logo */}
        <Text className="text-pink-500 text-2xl font-bold tracking-tight">
          E-Taas
        </Text>
        
        {/* Search Bar */}
        {showSearch && (
          <View className="flex-1 mx-4">
            <SearchBar 
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search products..."
            />
          </View>
        )}
        
        {/* Cart */}
        <TouchableOpacity 
          className="relative" 
          activeOpacity={0.7}
          onPress={onCartPress}
        >
          <ShoppingCart size={26} color="#EC4899" strokeWidth={2} />
          {cartCount > 0 && (
            <View className="absolute -top-2 -right-2 bg-pink-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};