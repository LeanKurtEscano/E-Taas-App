import { ProductCardProps } from "@/types/seller/manageProducts";

import { View, Text, Image, TouchableOpacity } from "react-native";
import { 
  Eye, 
  Edit, 
  Trash2,
  BarChart3,
} from 'lucide-react-native';
import { router } from "expo-router";

export const ProductCard: React.FC<ProductCardProps> = ({ product, showDeleteModal }) => {
   const productStock  = product.hasVariants ? product.variants.reduce((acc, variant) => acc + (variant.stock || 0), 0) : product.quantity;
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-300">
      <View className="flex-row">
     
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

       
        <View className="flex-1 ml-4">
          <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
            {product.name}
          </Text>
          <Text className="text-xs text-gray-500 mb-2">{product.category}</Text>
          <Text className="text-lg font-bold mb-1" style={{ color: '#E84393' }}>
            ₱{product.price.toLocaleString()}
          </Text>
          <Text className="text-xs text-gray-400">
            Quantity: {productStock} • {product.availability === 'out of stock' ? 'Out of Stock' : 'In Stock'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row mt-4 space-x-2" style={{ gap: 8 }}>
        <TouchableOpacity 
          className="flex-1 py-3 rounded-xl border border-gray-200 items-center flex-row justify-center"
          onPress={() => router.push(`/product/${product.id}`)}
        >
          <Eye size={16} color="#374151" strokeWidth={2} />
          <Text className="text-gray-700 font-semibold text-sm ml-1">View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 py-3 rounded-xl items-center flex-row justify-center"
          style={{ backgroundColor: '#E84393' }}
          onPress={() => router.push(`/seller/product?productId=${product.id}`)}
        >
          <Edit size={16} color="#FFFFFF" strokeWidth={2} />
          <Text className="text-white font-semibold text-sm ml-1">Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 py-3 rounded-xl border items-center flex-row justify-center"
          style={{ borderColor: '#EF4444' }}
          onPress={() => showDeleteModal(product.id)}
        >
          <Trash2 size={16} color="#EF4444" strokeWidth={2} />
          <Text className="font-semibold text-sm ml-1" style={{ color: '#EF4444' }}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Analytics Button */}
      <TouchableOpacity 
        className="mt-3 py-3 rounded-xl border border-gray-200 items-center flex-row justify-center"
      
      >
        <BarChart3 size={16} color="#374151" strokeWidth={2} />
        <Text className="text-gray-700 font-semibold text-sm ml-1">Product Analytics</Text>
      </TouchableOpacity>
    </View>
  )
}
