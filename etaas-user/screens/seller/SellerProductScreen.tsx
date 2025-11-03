import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  X, 
  Plus,
  PackageOpen
} from 'lucide-react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import useSellerStore from '@/hooks/seller/useSellerStore';
import { Product } from '@/types/seller/shop';
import { router } from 'expo-router';
import { Statistics } from '@/types/seller/manageProducts';
import { StatCard } from '@/components/seller/manageProductsScreen/StatisticsCard';
import { ProductCard } from '@/components/seller/manageProductsScreen/ProductCard';
import ReusableModal from '@/components/general/Modal';

const SellerProductScreen: React.FC = () => {
  const { userData } = useCurrentUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [showDeleteProduct, setShowDeleteProduct] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);
  const { listenToSellerProducts } = useSellerStore();
  const { deleteProduct } = useSellerStore();
  useEffect(() => {
    const unsubscribe = listenToSellerProducts((newProducts: Product[]) => {
      setProducts(newProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid, listenToSellerProducts]);


  const statistics = useMemo<Statistics>(() => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.availability !== 'out of stock').length;
    const outOfStock = products.filter(p => p.availability === 'out of stock').length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0) + products.reduce((sum, p) => sum 
    + (p.hasVariants ? p.variants!.reduce((variantSum, v) => variantSum + (v.price * v.stock), 0) : 0), 0);

    return { totalProducts, inStock, outOfStock, totalValue };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesAvailability = selectedAvailability === 'All' || 
                                 (selectedAvailability === 'In Stock' ? product.availability !== 'out of stock' : product.availability === 'out of stock');
      
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [products, searchQuery, selectedCategory, selectedAvailability]);

 
  const categories = useMemo<string[]>(() => {
    return ['All', 'Clothing', 'Accessories', 'Electronics', 'Home', 'Food & Beverages', 'Others'];
  }, []);


  const handleDeleteProduct = (productId: string) => {
    setProductIdToDelete(productId);
    setShowDeleteProduct(true);
  }

  const confirmDeleteProduct = async () => {
    if (productIdToDelete) {
      await deleteProduct(productIdToDelete);
      setProductIdToDelete(null);
      setShowDeleteProduct(false);
    }


  }

 
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#E84393" />
        <Text className="text-gray-500 mt-4">Loading products...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 " style={{ backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
      >
    
        <View className="px-5 pt-6 pb-4">
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-1">Manage Products</Text>
              <Text className="text-gray-500 text-sm">Track and manage your inventory</Text>
            </View>
            <TouchableOpacity
              className="rounded-xl items-center justify-center  ml-3 px-4 py-3 flex-row"
              style={{ backgroundColor: '#E84393' }}
              onPress={() => router.push('/seller/product')}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text className="text-white font-bold text-sm ml-1.5">Add Product</Text>
            </TouchableOpacity>
          </View>
        </View>

       
        <View className="px-5 mb-6">
          <View className="flex-row mb-3" style={{ gap: 12 }}>
            <StatCard
              title="TOTAL PRODUCTS"
              value={statistics.totalProducts}
              subtitle="All items"
              icon={<Package size={24} color="#EC4899" strokeWidth={2} />}
            />
            <StatCard
              title="IN STOCK"
              value={statistics.inStock}
              subtitle="Available"
              icon={<CheckCircle size={24} color="#EC4899" strokeWidth={2} />}
            />
          </View>
          <View className="flex-row" style={{ gap: 12 }}>
            <StatCard
              title="OUT OF STOCK"
              value={statistics.outOfStock}
              subtitle="Needs restock"
              icon={<AlertTriangle size={24} color="#EC4899" strokeWidth={2} />}
            />
            <StatCard
              title="TOTAL VALUE"
              value={`₱${statistics.totalValue.toLocaleString()}`}
              subtitle="Inventory worth"
              icon={<DollarSign size={24} color="#EC4899" strokeWidth={2} />}
            />
          </View>
        </View>

    
        <View className="px-5 mb-4">
          <View className="bg-white rounded-xl px-4 py-3 flex-row items-center border border-gray-300">
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-gray-900 ml-2"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color="#9CA3AF" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>

 
        <View className="px-5 mb-4">
          <Text className="text-xs font-semibold text-gray-500 mb-3 uppercase">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 2 }}
          >
            <View className="flex-row" style={{ gap: 8 }}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className="px-5 py-2.5 border border-gray-300 rounded-full"
                  style={{
                    backgroundColor: selectedCategory === category ? '#E84393' : 'white',
                  }}
                >
                  <Text
                    className="font-semibold text-sm"
                    style={{
                      color: selectedCategory === category ? 'white' : '#6B7280',
                    }}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

  
        <View className="px-5 mb-3">
          <Text className="text-xs font-semibold text-gray-500 mb-3 uppercase">Availability</Text>
          <View className="flex-row" style={{ gap: 8 }}>
            {['All', 'In Stock', 'Out of Stock'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setSelectedAvailability(status)}
                className="px-5 py-2.5 border border-gray-300 rounded-full"
                style={{
                  backgroundColor: selectedAvailability === status ? '#E84393' : 'white',
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{
                    color: selectedAvailability === status ? 'white' : '#6B7280',
                  }}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-5 pb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-gray-900">
              Products ({filteredProducts.length})
            </Text>
          </View>

          {filteredProducts.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <PackageOpen size={64} color="#9CA3AF" strokeWidth={1.5} />
              <Text className="text-gray-900 font-semibold text-base mb-1 mt-3">No products found</Text>
              <Text className="text-gray-500 text-sm text-center">
                {searchQuery ? 'Try adjusting your search or filters' : 'Start by adding your first product'}
              </Text>
            </View>
          ) : (
            filteredProducts.map((product, index) => (
              <ProductCard key={product.id || index} product={product} showDeleteModal={handleDeleteProduct} />
            ))
          )}
        </View>
      </ScrollView>
      {productIdToDelete && (
         <ReusableModal
           isVisible={showDeleteProduct}
           onCancel={() => setShowDeleteProduct(false)}
           onConfirm={confirmDeleteProduct}
           title="Confirm Deletion"
           description={`Are you sure you want to delete ${products.find(product => product.id === productIdToDelete)?.name}?`}
           confirmButtonColor='bg-red-500'
           confirmText='Delete'
         />
         
      )}
    </View>
  );
};

export default SellerProductScreen;