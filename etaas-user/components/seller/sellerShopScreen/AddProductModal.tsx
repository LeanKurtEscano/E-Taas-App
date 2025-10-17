// components/AddProductModal.tsx
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
  onSuccess: () => void;
  sellerId: string;
  existingProduct?: Product;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  visible,
  onClose,
  onSuccess,
  sellerId,
  existingProduct,
}) => {

    const { addProduct, updateProduct } = useSellerStore();
  const [name, setName] = useState(existingProduct?.name || '');
  const [price, setPrice] = useState(existingProduct?.price?.toString() || '');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [category, setCategory] = useState(existingProduct?.category || 'Clothing');
  const [availability, setAvailability] = useState<'available' | 'sold' | 'reserved'>(
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
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    setImageUris(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return;
    }

    if (!price.trim() || isNaN(Number(price))) {
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
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        category,
        availability,
        sellerId,
      };

      if (existingProduct) {
        await updateProduct(existingProduct.id, productData, imageUris);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await addProduct(productData, imageUris);
        Alert.alert('Success', 'Product added successfully');
      }

      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setCategory('Clothing');
    setAvailability('available');
    setImageUris([]);
  };

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

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Image Upload Section */}
          <View className="mt-6">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Product Images *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {imageUris.map((uri, index) => (
                  <View key={index} className="mr-3 relative">
                    <Image
                      source={{ uri }}
                      className="w-28 h-28 rounded-xl"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-lg"
                      onPress={() => removeImage(index)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  className="w-28 h-28 bg-gray-50 rounded-xl items-center justify-center border-2 border-dashed border-gray-300"
                  onPress={pickImages}
                  activeOpacity={0.7}
                >
                  <Upload size={28} color="#9CA3AF" />
                  <Text className="text-gray-500 text-xs mt-2 font-medium">Add Photo</Text>
                </TouchableOpacity>
              </View>
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
              value={name}
              onChangeText={setName}
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
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category */}
          <View className="mt-5">
            <Text className="text-base font-semibold text-gray-900 mb-3">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-5 py-3 rounded-full mr-2 ${
                      category === cat 
                        ? 'bg-pink-500 shadow-md' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        category === cat ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                  onPress={() => setAvailability(option)}
                  className={`px-5 py-3 rounded-full mr-2 mb-2 ${
                    availability === option 
                      ? 'bg-pink-500 shadow-md' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-semibold text-sm capitalize ${
                      availability === option ? 'text-white' : 'text-gray-700'
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
              value={description}
              onChangeText={setDescription}
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