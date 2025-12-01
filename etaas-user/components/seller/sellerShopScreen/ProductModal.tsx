import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Pressable } from 'react-native';
interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onAddProduct?: (productData: any) => Promise<void>;
 
}

export default function AddProductModal({
  visible,
  onClose,

}: AddProductModalProps) {
  const { userData } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');

  const categories = ['Clothing', 'Accessories', 'Electronics', 'Home'];
  const conditions = ['Brand New', 'Like New', 'Good', 'Fair'];

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!productName || !price || !category || images.length === 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields and add at least one image');
      return;
    }

    setLoading(true);
    try {
      // Upload images to Cloudinary
      //const uploadedImageUrls = await Promise.all(
       
      //images.map(imageUri =>   )
     // );

      // Create product data
      const productData = {
        name: productName,
        description,
        price: parseFloat(price),
        category,
        condition,
       // images: uploadedImageUrls,
        sellerId: userData?.uid,
        createdAt: new Date().toISOString(),
      };

    
      
      // Reset form
      setProductName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setCondition('');
      setImages([]);
      
      Alert.alert('Success', 'Product added successfully!');
      onClose();
    } catch (error) {
     
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderImagePreview = () => {
    const displayImages = images.slice(0, 3);
    const remainingCount = images.length - 3;

    return (
      <View className="flex-row gap-2 mb-4">
        {displayImages.map((uri, index) => (
          <View key={index} className="relative">
            <Image
              source={{ uri }}
              className="w-24 h-24 rounded-lg"
            />
            <TouchableOpacity
              onPress={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
            >
              <Text className="text-white text-xs font-bold">×</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {remainingCount > 0 && (
          <View className="w-24 h-24 rounded-lg bg-gray-200 items-center justify-center">
            <Text className="text-2xl font-bold text-gray-600">
              +{remainingCount}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          <View className="p-4 border-b border-gray-200 flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-base text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold">Add Product</Text>
            <View className="w-16" />
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Image Upload Section */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-2">
                Photos <Text className="text-red-500">*</Text>
              </Text>
              
              {images.length > 0 && renderImagePreview()}
              
              <TouchableOpacity
                onPress={pickImages}
                className="bg-pink-50 border-2 border-dashed border-[#FF1F8F] rounded-lg p-4 items-center"
              >
                <Text className="text-[#FF1F8F] font-semibold text-base">
                  + Add Images
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {images.length}/10 images
                </Text>
              </TouchableOpacity>
            </View>

            {/* Product Name */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2">
                Product Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={productName}
                onChangeText={setProductName}
                placeholder="e.g., Vintage Denim Jacket"
                className="border border-gray-300 rounded-lg p-3 text-base"
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your item..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="border border-gray-300 rounded-lg p-3 text-base"
              />
            </View>

            {/* Price */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2">
                Price <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="border border-gray-300 rounded-lg p-3 text-base"
              />
            </View>

            {/* Category */}
            <View className="mb-4">
              <Text className="text-base font-semibold mb-2">
                Category <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      category === cat
                        ? 'bg-[#FF1F8F] border-[#FF1F8F]'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        category === cat ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Condition */}
            <View className="mb-6">
              <Text className="text-base font-semibold mb-2">Condition</Text>
              <View className="flex-row flex-wrap gap-2">
                {conditions.map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    onPress={() => setCondition(cond)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      condition === cond
                        ? 'bg-[#FF1F8F] border-[#FF1F8F]'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        condition === cond ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {cond}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="bg-[#FF1F8F] rounded-lg p-4 items-center"
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Add Product
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}