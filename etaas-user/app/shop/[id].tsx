// app/shop.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  Share2,
  MessageCircle,
} from 'lucide-react-native';
import { useShopData } from '@/hooks/general/useShopData';
import { ShopProductCard } from '@/components/user/viewShop/ShopProductCard';
import { getInitials } from '@/utils/general/initials';
import { ConversationModal } from '@/components/general/ConversationModal';

const { width } = Dimensions.get('window');

const ShopScreen = () => {
  const { id } = useLocalSearchParams();
  const { shopInfo, products, loading, error, fullSellerData } = useShopData(id as string);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const categories = ['All', 'Clothing', 'Accessories', 'Electronics', 'Home', 'Food & Beverages', 'Others'];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text className="text-gray-600 mt-4">Loading shop...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !shopInfo) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl mb-2">😔</Text>
          <Text className="text-gray-900 font-bold text-lg mb-2">Shop Not Found</Text>
          <Text className="text-gray-600 text-center mb-6">{error || 'This shop does not exist'}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-pink-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
            {shopInfo.shopName}
          </Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity className="p-2">
            <Share2 size={22} color="#ec4899" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowConversationModal(true)} className="p-2">
            <MessageCircle size={22} color="#ec4899" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Shop Banner */}
        {shopInfo.coverPhoto ? (
          <View className="h-40 relative">
            <Image
              source={{ uri: shopInfo.coverPhoto }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {/* Optional overlay for better visibility */}
            <View className="absolute inset-0 bg-black opacity-10" />
          </View>
        ) : (
          <View className="bg-gradient-to-br from-pink-400 to-pink-600 h-40 relative">
            <View className="absolute inset-0 bg-pink-500" />
            {/* Decorative Pattern */}
            <View className="absolute inset-0 opacity-20">
              <View className="absolute top-4 left-4 w-20 h-20 border-4 border-white rounded-full" />
              <View className="absolute bottom-6 right-8 w-16 h-16 border-4 border-white rounded-full" />
            </View>
          </View>
        )}
        {/* Shop Info Card */}
        <View className="bg-white mx-4 -mt-20 rounded-2xl  p-5 border border-gray-300">
          <View className="flex-row items-start mb-4">
            <View className="bg-pink-100 w-16 h-16 rounded-full items-center justify-center mr-4">
              <Text className="text-pink-600 font-bold text-2xl">
                {getInitials(shopInfo.shopName)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-xl mb-1">
                {shopInfo.shopName}
              </Text>
              <Text className="text-gray-600 text-sm mb-2">{shopInfo.businessName}</Text>
              <View className="flex-row items-center">
                <View className="bg-pink-500 px-2 py-1 rounded-md">
                  <Text className="text-white text-xs font-semibold">
                    {products.length} Products
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View className="space-y-2">
            <View className="flex-row items-center">
              <MapPin size={16} color="#ec4899" />
              <Text className="text-gray-700 text-sm ml-2 flex-1" numberOfLines={2}>
                {shopInfo.addressLocation}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Phone size={16} color="#ec4899" />
              <Text className="text-gray-700 text-sm ml-2">{shopInfo.contactNumber}</Text>
            </View>
            <View className="flex-row items-center">
              <Mail size={16} color="#ec4899" />
              <Text className="text-gray-700 text-sm ml-2">{shopInfo.email}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity className="flex-1 bg-pink-500 py-3 rounded-full items-center">
              <Text className="text-white font-semibold">Follow Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowConversationModal(true)} className="bg-pink-100 px-6 py-3 rounded-full items-center">
              <MessageCircle size={20} color="#ec4899" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search & Filter */}
        <View className="px-4 py-4 bg-white mt-4">
          <View className="flex-row gap-2">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <Search size={20} color="#9ca3af" />
              <TextInput
                placeholder="Search products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-2 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <TouchableOpacity className="bg-pink-500 w-12 h-12 rounded-full items-center justify-center">
              <SlidersHorizontal size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="bg-gray-100 w-12 h-12 rounded-full items-center justify-center"
            >
              {viewMode === 'grid' ? (
                <Grid3x3 size={20} color="#ec4899" />
              ) : (
                <List size={20} color="#ec4899" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="bg-white px-4 py-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${selectedCategory === category
                  ? 'bg-pink-500'
                  : 'bg-gray-100'
                }`}
            >
              <Text
                className={`font-semibold ${selectedCategory === category
                    ? 'text-white'
                    : 'text-gray-600'
                  }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View className="px-4 py-4">
          {filteredProducts.length === 0 ? (
            <View className="items-center py-20">
              <Text className="text-6xl mb-4">🛍️</Text>
              <Text className="text-gray-900 font-bold text-lg mb-2">No Products Found</Text>
              <Text className="text-gray-600 text-center">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'This shop has no products yet'}
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filteredProducts.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ConversationModal 
        visible={showConversationModal}
        onClose={() => setShowConversationModal(false)}
        sellerData={fullSellerData}
      />
    </SafeAreaView>
  );
};

export default ShopScreen;