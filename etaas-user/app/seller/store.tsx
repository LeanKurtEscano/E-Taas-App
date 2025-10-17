// screens/MyShopScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { ShopHeader } from '@/components/seller/sellerShopScreen/ShopHeader';
import { SearchFilterBar } from '@/components/seller/sellerShopScreen/SearchFilterBar';
import { CategoryTabs } from '@/components/seller/sellerShopScreen/CategoryTabs';
import { ProductCard } from '@/components/seller/sellerShopScreen/ProductCard';
import { EmptyState } from '@/components/seller/sellerShopScreen/EmptyState';
import { FloatingAddButton } from '@/components/seller/sellerShopScreen/FloatingAddButton';
import useSellerStore from '@/hooks/seller/useSellerStore';
import { Product, ShopData, ViewMode } from '@/types/seller/shop';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
const MyShopScreen: React.FC = () => {
  const { userData } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { fetchSellerProducts } = useSellerStore();
  const categories = [
    'All',
    'Clothing',
    'Accessories',
    'Electronics',
    'Home',
    'Others',
  ];

  const shopData: ShopData = {
    shopName: userData?.sellerInfo?.shopName || '',
    businessName: userData?.sellerInfo?.businessName || '',
    addressLocation: userData?.sellerInfo?.addressLocation || '',
    contactNumber: userData?.sellerInfo?.contactNumber || '',
    email: userData?.sellerInfo?.email || '',
    rating: 4.8,
    reviewCount: 127,
    followers: 1523,
    description: 'Quality thrift finds at affordable prices! ✨',
  };
  {/* useEffect(() => {
    loadProducts();
  }, [userData?.uid]);*/ }


  const loadProducts = async () => {
    if (!userData?.uid) return;

    setLoading(true);
    try {
      const fetchedProducts = await fetchSellerProducts(userData.uid);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {

    Alert.alert('Add Product', 'Navigate to Add Product screen');
  };

  const handleEditShop = () => {

    Alert.alert('Edit Shop', 'Navigate to Edit Shop screen');
  };

  const handleFilterPress = () => {
    Alert.alert('Filter', 'Filter options will appear here');
  };

  const handleProductPress = (product: Product) => {
    Alert.alert('Product', `View ${product.name}`);
  };

  const handleCoverPhotoPress = () => {
    Alert.alert('Cover Photo', 'Select new cover photo');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 py-3 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} className="mr-3">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Shop</Text>
      </View>

      <ScrollView className="flex-1">
        <ShopHeader
          shopData={shopData}
          isOwner={true}
          onEdit={handleEditShop}
          onCoverPhotoPress={handleCoverPhotoPress}
        />

        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterPress={handleFilterPress}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#E91E8C" />
          </View>
        ) : !filteredProducts || filteredProducts.length === 0 ? (
          <EmptyState onAddProduct={handleAddProduct} />
        ) : (
          <View className="p-3">
            {viewMode === "grid" ? (
              <View className="flex-row flex-wrap justify-between">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onPress={() => handleProductPress(product)}
                  />
                ))}
              </View>
            ) : (
              <View>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onPress={() => handleProductPress(product)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

      </ScrollView>

      <FloatingAddButton onPress={handleAddProduct} />
    </SafeAreaView>
  );
};

export default MyShopScreen;