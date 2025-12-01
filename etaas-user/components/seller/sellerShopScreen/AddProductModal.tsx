// components/ProductModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, Upload, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import useSellerStore from '@/hooks/seller/useSellerStore';
import { Product } from '@/types/seller/shop';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  sellerId?: string;
  existingProduct?: Product;
}

export const ProductModal: React.FC<AddProductModalProps> = ({
  visible,
  onClose,
  sellerId,
  existingProduct,
}) => {
  const { addProduct, updateProduct } = useSellerStore();
  const [productName, setProductName] = useState(existingProduct?.name || '');
  const [productPrice, setProductPrice] = useState(existingProduct?.price?.toString() || '');
  const [productDescription, setProductDescription] = useState(existingProduct?.description || '');
  const [productCategory, setProductCategory] = useState(existingProduct?.category || 'Clothing');
  const [productAvailability, setProductAvailability] = useState<'available' | 'sold' | 'reserved'>(
    existingProduct?.availability || 'available'
  );
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = ['Clothing', 'Accessories', 'Electronics', 'Home', 'Others'];
  const availabilityOptions: Array<'available' | 'sold' | 'reserved'> = [
    'available',
    'sold',
    'reserved',
  ];

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        const newUris = result.assets.map(asset => asset.uri);
        setImageUris(prev => [...prev, ...newUris]);
      }
    } catch (error) {
     
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    setImageUris(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!sellerId) {
      Alert.alert('Error', 'Seller ID is required');
      return;
    }

    if (!productName.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return;
    }

    if (!productPrice.trim() || isNaN(Number(productPrice))) {
      Alert.alert('Error', 'Please enter valid price');
      return;
    }

    if (imageUris.length === 0 && !existingProduct) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: productName.trim(),
        price: Number(productPrice),
        description: productDescription.trim(),
        category: productCategory,
        availability: productAvailability,
        sellerId,
      };

      if (existingProduct) {
        await updateProduct(existingProduct.id, productData, imageUris);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await addProduct(productData, imageUris);
        Alert.alert('Success', 'Product added successfully');
      }

      resetForm();
      onClose();
    } catch (error) {
     
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductName('');
    setProductPrice('');
    setProductDescription('');
    setProductCategory('Clothing');
    setProductAvailability('available');
    setImageUris([]);
  };

  // Calculate visible images and remaining count
  const visibleImages = imageUris.slice(0, 3);
  const remainingCount = imageUris.length - 3;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-6 flex-row items-center justify-between shadow-sm">
          <Text className="text-2xl font-bold text-gray-900">
            {existingProduct ? 'Edit Product' : 'Add Product'}
          </Text>
          <TouchableOpacity 
            onPress={onClose} 
            disabled={loading}
            className="p-2 rounded-full bg-gray-100 active:bg-gray-200"
          >
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Upload Section */}
          <View className="mt-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Product Images *
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {/* Add Photo Button - Always first */}
              <TouchableOpacity
                className="w-28 h-28 bg-gray-50 rounded-xl items-center justify-center border-2 border-dashed border-gray-300 mr-3"
                onPress={pickImages}
                activeOpacity={0.7}
              >
                <Upload size={28} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs mt-2 font-medium">Add Photo</Text>
              </TouchableOpacity>

              {/* First 3 images */}
              {visibleImages.map((uri, index) => (
                <View key={index} className="mr-3 relative">
                  <Image
                    source={{ uri }}
                    className="w-28 h-28 rounded-xl"
                    resizeMode="cover"
                  />
                  {index === 2 && remainingCount > 0 && (
                    <View className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center">
                      <Text className="text-white text-2xl font-bold">
                        +{remainingCount}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-lg"
                    onPress={() => removeImage(index)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Product Name */}
          <View className="mt-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Product Name *
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 text-base border border-gray-200"
              placeholder="Enter product name"
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Price */}
          <View className="mt-5">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Price (₱) *
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 text-base border border-gray-200"
              placeholder="0.00"
              value={productPrice}
              onChangeText={setProductPrice}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category */}
          <View className="mt-5">
            <Text className="text-base font-semibold text-gray-900 mb-3">Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setProductCategory(cat)}
                  className={`px-5 py-3 rounded-full mr-2 ${
                    productCategory === cat 
                      ? 'bg-pink-500 shadow-md' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      productCategory === cat ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Availability */}
          <View className="mt-5">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Availability
            </Text>
            <View className="flex-row flex-wrap">
              {availabilityOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setProductAvailability(option)}
                  className={`px-5 py-3 rounded-full mr-2 mb-2 ${
                    productAvailability === option 
                      ? 'bg-pink-500 shadow-md' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-semibold text-sm capitalize ${
                      productAvailability === option ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View className="mt-5 mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Description
            </Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-4 text-gray-900 text-base border border-gray-200"
              placeholder="Tell us more about this product..."
              value={productDescription}
              onChangeText={setProductDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
              style={{ minHeight: 100 }}
            />
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`rounded-xl py-4 items-center justify-center ${
              loading ? 'bg-gray-300' : 'bg-pink-500'
            }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  Saving...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">
                {existingProduct ? 'Update Product' : 'Add Product'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};