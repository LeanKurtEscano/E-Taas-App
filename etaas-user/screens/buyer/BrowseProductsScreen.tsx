import { useEffect, useState } from 'react';
import { View, FlatList, Text, ScrollView, RefreshControl } from 'react-native';
import { useProductStore } from '@/store/useProductStore';
import ProductCard from '@/components/user/browseProduct/ProductCard';
import EmptyState from '@/components/user/browseProduct/EmptyState';
import FilterChip from '@/components/user/browseProduct/FilterChip';
import SortButton from '@/components/user/browseProduct/SortButton';
import { SearchX } from 'lucide-react-native';
import { useHomeStore } from '@/store/useHomeStore';

const categories = ['All', 'Clothing', 'Accessories', 'Electronics', 'Home', 'Food & Beverages', 'Others'];

const BrowseProductsScreen = () => {
  const { products, fetchProducts } = useProductStore();
  const { productCategory, setProductCategory } = useHomeStore();
  const [sortBy, setSortBy] = useState<'latest' | 'price-low' | 'price-high'>('latest');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProducts();
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredProducts = products
    .filter(product => productCategory === 'All' || product.category === productCategory)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const renderProduct = ({ item }: any) => (
    <ProductCard product={item} />
  );

  const renderHeader = () => (
    <View className="bg-white">
      <View className="px-4 pt-4 pb-3">
        <Text className="text-base font-bold text-gray-900 mb-3">Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {categories.map((category) => (
            <FilterChip
              key={category}
              label={category}
              selected={productCategory === category}
              onPress={() => setProductCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      <View className="flex-row items-center justify-between px-4 py-3 border-t border-gray-100">
        <Text className="text-sm text-gray-600">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
        </Text>
        <SortButton sortBy={sortBy} onSortChange={setSortBy} />
      </View>
    </View>
  );

  if (products.length === 0 && !refreshing) {
    return <EmptyState />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        contentContainerClassName="pb-6"
        columnWrapperClassName="px-4 gap-3 mb-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ec4899']} // Android
            tintColor="#ec4899" // iOS
            progressViewOffset={0} // Ensures spinner is visible on iOS
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16 px-6">
            <View className="bg-gray-100 rounded-full w-20 h-20 items-center justify-center mb-4">
              <SearchX size={36} color="#9CA3AF" strokeWidth={2} />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-2">No Products Found</Text>
            <Text className="text-sm text-gray-500 text-center">
              Try adjusting your filters or check back later for new items
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default BrowseProductsScreen;