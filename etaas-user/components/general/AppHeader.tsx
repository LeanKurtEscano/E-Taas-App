import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingCart, MessageCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { SearchBar } from '../user/userHomeScreen/SearchBar';
import { UserData } from '@/types/seller/shop';
interface AppHeaderProps {
  searchQuery: string;
  cartCount: number;
  totalUnreadCount: number;
  onCartPress: () => void;
  showSearch?: boolean;
  user: UserData;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  cartCount,
  onCartPress,
  showSearch = true,
  totalUnreadCount,
  user,
}) => {



  const handleInboxPress = () => {
    router.push('/inbox/inbox' as any);
  };

  return (
    <View className="bg-white pt-4 pb-4 px-5">
      <View className="flex-row items-center justify-between">
        {/* Logo */}
        <Text className="text-pink-500 text-2xl font-bold tracking-tight">
          E-TAAS
        </Text>
        
        {/* Search Bar */}
        {showSearch && (
          <View className="flex-1 mx-4">
            <SearchBar 
              placeholder="Search products..."
            />
          </View>
        )}
        
        {/* Action Icons */}
        <View className="flex-row items-center gap-4">
          {/* Inbox/Messages Icon */}
          <TouchableOpacity 
            className="relative" 
            activeOpacity={0.7}
            onPress={handleInboxPress}
          >
            <MessageCircle size={26} color="#EC4899" strokeWidth={2} />
            {totalUnreadCount > 0 && (
              <View className="absolute -top-2 -right-2 bg-pink-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cart Icon */}
          <TouchableOpacity 
            className="relative" 
            activeOpacity={0.7}
            onPress={onCartPress}
          >
            <ShoppingCart size={26} color="#EC4899" strokeWidth={2} />
            {cartCount > 0 && (
              <View className="absolute -top-2 -right-2 bg-pink-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};