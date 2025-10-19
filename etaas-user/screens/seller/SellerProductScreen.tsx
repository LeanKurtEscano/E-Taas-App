import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  X, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  PackageOpen
} from 'lucide-react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import useSellerStore from '@/hooks/seller/useSellerStore';
import { Product } from '@/types/seller/shop';

interface Statistics {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  totalValue: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}

interface ProductCardProps {
  product: Product;
}

const SellerProductScreen: React.FC = () => {
  const { userData } = useCurrentUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');

  const { listenToSellerProducts } = useSellerStore();

  useEffect(() => {
    const unsubscribe = listenToSellerProducts((newProducts: Product[]) => {
      setProducts(newProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid, listenToSellerProducts]);

  // Statistics calculations
  const statistics = useMemo<Statistics>(() => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.availability !== 'out of stock').length;
    const outOfStock = products.filter(p => p.availability === 'out of stock').length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

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

  const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => (
    <View className="bg-white rounded-2xl p-4 flex-1 shadow-sm" style={{ minHeight: 110 }}>
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-gray-500 text-xs font-medium">{title}</Text>
        {icon}
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
      {subtitle && <Text className="text-xs text-gray-400">{subtitle}</Text>}
    </View>
  );

  const ProductCard: React.FC<ProductCardProps> = ({ product }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row">
        {/* Product Image */}
        <View className="relative">
          <Image
            source={{ uri: product.images?.[0] }}
            className="w-24 h-24 rounded-xl"
            resizeMode="cover"
          />
          {product.availability === 'out of stock' && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-semibold">Sold</Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View className="flex-1 ml-4">
          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
            {product.name}
          </Text>
          <Text className="text-xs text-gray-500 mb-2">{product.category}</Text>
          <Text className="text-lg font-bold mb-1" style={{ color: '#E84393' }}>
            ₱{product.price.toLocaleString()}
          </Text>
          <Text className="text-xs text-gray-400">
            Quantity: {product.quantity} • {product.availability === 'out of stock' ? 'Out of Stock' : 'In Stock'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row mt-4 space-x-2" style={{ gap: 8 }}>
        <TouchableOpacity 
          className="flex-1 py-3 rounded-xl border border-gray-200 items-center flex-row justify-center"
          onPress={() => console.log('View', product.name)}
        >
          <Eye size={16} color="#374151" strokeWidth={2} />
          <Text className="text-gray-700 font-semibold text-sm ml-1">View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
          style={{ backgroundColor: '#E84393' }}
          onPress={() => console.log('Edit', product.name)}
        >
          <Edit size={16} color="#FFFFFF" strokeWidth={2} />
          <Text className="text-white font-semibold text-sm ml-1">Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 py-3 rounded-xl border items-center flex-row justify-center"
          style={{ borderColor: '#EF4444' }}
          onPress={() => console.log('Delete', product.name)}
        >
          <Trash2 size={16} color="#EF4444" strokeWidth={2} />
          <Text className="font-semibold text-sm ml-1" style={{ color: '#EF4444' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#E84393" />
        <Text className="text-gray-500 mt-4">Loading products...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-1">Manage Products</Text>
              <Text className="text-gray-500 text-sm">Track and manage your inventory</Text>
            </View>
            <TouchableOpacity
              className="rounded-xl items-center justify-center shadow-lg ml-3 px-4 py-3 flex-row"
              style={{ backgroundColor: '#E84393' }}
              onPress={() => console.log('Add Product')}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text className="text-white font-bold text-sm ml-1.5">Add Product</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Cards - 2x2 Grid */}
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

        {/* Search Bar */}
        <View className="px-5 mb-4">
          <View className="bg-white rounded-xl px-4 py-3 flex-row items-center shadow-sm">
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

        {/* Category Filter */}
        <View className="px-5 mb-4">
          <Text className="text-xs font-semibold text-gray-500 mb-3 uppercase">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row" style={{ gap: 8 }}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className="px-5 py-2.5 rounded-full"
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

        {/* Availability Filter */}
        <View className="px-5 mb-4">
          <Text className="text-xs font-semibold text-gray-500 mb-3 uppercase">Availability</Text>
          <View className="flex-row" style={{ gap: 8 }}>
            {['All', 'In Stock', 'Out of Stock'].map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setSelectedAvailability(status)}
                className="px-5 py-2.5 rounded-full"
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

        {/* Products List */}
        <View className="px-5 pb-6">
          <View className="flex-row justify-between items-center mb-4">
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
              <ProductCard key={product.id || index} product={product} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SellerProductScreen;