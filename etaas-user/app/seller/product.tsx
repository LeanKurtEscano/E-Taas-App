// screens/ProductScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Upload, Trash2, Plus, Minus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import useSellerStore from '@/hooks/seller/useSellerStore';
import { Product } from '@/types/seller/shop';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const ProductScreen: React.FC = () => {
  const {userData} = useCurrentUser();
  const params = useLocalSearchParams();
  const sellerId = userData?.uid;
  const productId = params.productId as string | undefined;
  console.log('Editing product with ID:', productId);
  
  const router = useRouter();
  const sellerStore = useSellerStore();
  
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCategory, setProductCategory] = useState('Clothing');
  const [productAvailability, setProductAvailability] = useState<'available' | 'sold' | 'reserved'>('available');
  const [productQuantity, setProductQuantity] = useState(1);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // Track original images
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Track deleted images
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [imageError, setImageError] = useState('');

  const categories = ['Clothing', 'Accessories', 'Electronics', 'Home', 'Food & Beverages', 'Others'];
  const availabilityOptions: Array<'available' | 'sold' | 'reserved'> = [
    'available',
    'sold',
    'reserved',
  ];

  // Fetch product data if editing
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      setFetchingProduct(true);
      try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const data = productSnap.data();
          setProductName(data.name || '');
          setProductPrice(data.price?.toString() || '');
          setProductDescription(data.description || '');
          setProductCategory(data.category || 'Clothing');
          setProductAvailability(data.availability || 'available');
          setProductQuantity(data.quantity || 1);
          
          // Store both in imageUris (for display) and existingImageUrls (for tracking)
          const existingImages = data.images || [];
          setImageUris(existingImages);
          setExistingImageUrls(existingImages);
        } else {
          Alert.alert('Error', 'Product not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'Failed to load product data');
        router.back();
      } finally {
        setFetchingProduct(false);
      }
    };

    fetchProductData();
  }, [productId]);

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
        setImageError(''); // Clear error when images are added
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = imageUris[index];
    
    // If this is an existing image (not a newly picked one), track it for deletion
    if (existingImageUrls.includes(imageToRemove)) {
      setImagesToDelete(prev => [...prev, imageToRemove]);
    }
    
    // Remove from display
    setImageUris(prev => prev.filter((_, i) => i !== index));
  };

  const incrementQuantity = () => {
    setProductQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setProductQuantity(prev => (prev > 1 ? prev - 1 : 1));
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

    if (imageUris.length === 0) {
      setImageError('Please add at least one image');
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
        quantity: productQuantity,
        sellerId,
      };

      if (productId) {
        // Separate existing images from new ones
        const existingImages = imageUris.filter(uri => existingImageUrls.includes(uri));
        const newImages = imageUris.filter(uri => !existingImageUrls.includes(uri));
        
        await sellerStore.updateProduct(
          productId, 
          productData, 
          newImages, // Only new images to upload
          existingImages, // Existing images to keep
          imagesToDelete // Images to delete from Storage
        );
        Alert.alert('Success', 'Product updated successfully!');
      } else {
        await sellerStore.addProduct(productData, imageUris);
        Alert.alert('Success', 'Product added successfully!');
      }
      
      router.back();
      
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const visibleImages = imageUris.slice(0, 2);
  const remainingCount = imageUris.length - 2;

  if (fetchingProduct) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-600 mt-4 font-medium">Loading product...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-6 flex-row items-center shadow-sm">
        <TouchableOpacity 
          onPress={() => router.back()} 
          disabled={loading}
          className="p-2 rounded-full active:bg-gray-200 mr-4"
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">
          {productId ? 'Edit Product' : 'Add Product'}
        </Text>
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
          <View className='flex flex-row'>
            <TouchableOpacity
              className="w-28 h-28 bg-gray-50 rounded-xl items-center justify-center border-2 border-dashed border-gray-300 mr-3"
              onPress={pickImages}
              activeOpacity={0.7}
            >
              <Upload size={28} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs mt-2 font-medium">Add Photo</Text>
            </TouchableOpacity>

            {visibleImages.map((uri, index) => (
              <View key={index} className="mr-3 relative">
                <Image
                  source={{ uri }}
                  className="w-28 h-28 rounded-xl"
                  resizeMode="cover"
                />
                {index === 1 && remainingCount > 0 && (
                  <View className="absolute inset-0 bg-black/60 rounded-xl items-center justify-center">
                    <Text className="text-white text-2xl font-bold">
                      +{remainingCount}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  className="absolute -right-2 bg-red-500 rounded-full p-1.5 shadow-lg"
                  onPress={() => removeImage(index)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {imageError ? (
            <Text className="text-red-500 text-sm mt-2 font-medium">
              {imageError}
            </Text>
          ) : null}
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

        {/* Quantity - Only in Edit Mode */}
        {productId && (
          <View className="mt-5">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Quantity
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={decrementQuantity}
                className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center border border-gray-200"
                activeOpacity={0.7}
              >
                <Minus size={20} color="#374151" />
              </TouchableOpacity>
              
              <View className="mx-6 min-w-[60px] items-center">
                <Text className="text-2xl font-bold text-gray-900">
                  {productQuantity}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={incrementQuantity}
                className="w-12 h-12 bg-pink-500 rounded-xl items-center justify-center"
                activeOpacity={0.7}
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Category */}
        <View className="mt-5">
          <Text className="text-base font-semibold text-gray-900 mb-3">Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setProductCategory(category)}
                className={`px-5 py-3 rounded-full mr-2 ${
                  productCategory === category
                    ? 'bg-pink-500'
                    : 'bg-gray-50 border border-gray-200'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-semibold text-sm ${
                    productCategory === category ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Availability - Only in Edit Mode */}
        {productId && ( 
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
                      ? 'bg-pink-500'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-semibold text-sm capitalize ${
                      productAvailability === option ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
              {productId ? 'Update Product' : 'Add Product'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductScreen;