// screens/ProductScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Upload, Trash2, Plus, Minus } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import VariantModal from '@/components/seller/manageProductsScreen/ProductVariant';
import GeneralToast from '@/components/general/GeneralToast';
import useToast from '@/hooks/general/useToast';
import { useProductCrud } from '@/hooks/seller/useProductCrud';
import { useState } from 'react';

const ProductScreen: React.FC = () => {
  const { userData } = useCurrentUser();
  const params = useLocalSearchParams();
  const sellerId = userData?.uid;

  const sellerIdInt = userData?.sellerInfo.sellerId;
  const productId = params.productId as string | undefined;
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState({
    productName: false,
    productPrice: false,
    productDescription: false,
  });

  const { toastVisible, toastMessage, toastType, showToast, setToastVisible } = useToast();

  const {
    // State
    productName,
    productPrice,
    productDescription,
    productCategory,
    productAvailability,
    productQuantity,
    imageUris,
    imageError,
    variantModalVisible,
    hasVariants,
    variantCategories,
    variants,
    loading,
    fetchingProduct,
    handleQuantityChange,

    // Setters
    setProductName,
    setProductPrice,
    setProductDescription,
    setProductCategory,
    setProductAvailability,
    setVariantModalVisible,

    // Functions
    pickImages,
    removeImage,
    incrementQuantity,
    decrementQuantity,
    handleSaveVariants,
    toggleVariants,
    disableVariants,
    handleSubmit,

    // Constants
    categories,
    availabilityOptions,

    // Computed
    visibleImages,
    remainingCount,

    productNameRef,
    productPriceRef,
    productDescriptionRef,
  } = useProductCrud({ sellerId, sellerIdInt, productId, showToast, setFieldErrors });

  const handleToggleVariants = () => {
    const result = toggleVariants();
    if (result === 'confirm') {
      Alert.alert(
        'Disable Variants',
        'Are you sure you want to disable variants? This will remove all variant data.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: disableVariants,
          },
        ]
      );
    }
  };

  if (fetchingProduct) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-600 mt-4 font-medium">Loading product...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
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
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Product Images */}
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
            ref={productNameRef}
            className={`bg-gray-50 rounded-xl px-4 py-4 text-gray-900 text-base border ${fieldErrors.productName ? 'border-red-500' : 'border-gray-200'
              }`}
            placeholder="Enter product name"
            value={productName}
            onChangeText={(text) => {
              setProductName(text);
              setFieldErrors(prev => ({ ...prev, productName: false }));
            }}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Price */}
        <View className="mt-5">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Price (₱) *
          </Text>
          <TextInput
            ref={productPriceRef}
            className={`bg-gray-50 rounded-xl px-4 py-4 text-gray-900 text-base border ${fieldErrors.productPrice ? 'border-red-500' : 'border-gray-200'
              }`}
            placeholder="0.00"
            value={productPrice}
            onChangeText={(text) => {
              setProductPrice(text);
              setFieldErrors(prev => ({ ...prev, productPrice: false }));
            }}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Quantity - Hide when variants are enabled */}
        {/* Quantity - Hide when variants are enabled */}
        {!hasVariants && (
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

              <View className="mx-6 min-w-[100px]">
                <TextInput
                  className={`text-2xl font-bold text-center rounded-xl px-4 py-2 border ${productQuantity >= 9999
                    ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                  value={productQuantity.toString()}
                  onChangeText={handleQuantityChange}
                  keyboardType="numeric"
                  selectTextOnFocus
                  maxLength={4}
                />
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
                className={`px-5 py-3 rounded-full mr-2 ${productCategory === category
                  ? 'bg-pink-500'
                  : 'bg-gray-50 border border-gray-200'
                  }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-semibold text-sm ${productCategory === category ? 'text-white' : 'text-gray-700'
                    }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>



        <View className="mt-5">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Availability
          </Text>
          <View className="flex-row flex-wrap">
            {availabilityOptions.map((option) => {
         
               const isDisabled = 
  (option === "out of stock" || option === "unavailable") &&
  productQuantity > 0 || (option === "available" && productQuantity === 0);


              const isSelected = productAvailability === option;

              return (
                <TouchableOpacity
                  key={option}
                  disabled={isDisabled}
                  onPress={() => setProductAvailability(option)}
                  activeOpacity={0.7}
                  className={`
          px-5 py-3 rounded-full mr-2 mb-2 
          ${isDisabled
                      ? "bg-gray-300 border border-gray-300 opacity-50"
                      : isSelected
                        ? "bg-pink-500"
                        : "bg-gray-50 border border-gray-200"
                    }
        `}
                >
                  <Text
                    className={`
            font-semibold text-sm capitalize 
            ${isDisabled
                        ? "text-gray-500"
                        : isSelected
                          ? "text-white"
                          : "text-gray-700"
                      }
          `}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Variant Section */}
        <View className="mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-900">
              Product Variants
            </Text>
            <TouchableOpacity
              onPress={handleToggleVariants}
              className={`px-4 py-2 rounded-full ${hasVariants ? 'bg-pink-500' : 'bg-gray-200'
                }`}
            >
              <Text className={`text-xs font-semibold ${hasVariants ? 'text-white' : 'text-gray-700'
                }`}>
                {hasVariants ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>

          {hasVariants ? (
            <View>
              <Text className="text-sm text-gray-600 mb-3">
                Add variants like Color, Size, Material to create different product options.
              </Text>

              {variantCategories.length > 0 && (
                <View className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-200">
                  <Text className="text-sm font-semibold text-gray-900 mb-2">
                    Current Variants ({variants.length})
                  </Text>
                  {variantCategories.map((cat) => (
                    <Text key={cat.id} className="text-xs text-gray-600 mb-1">
                      • {cat.name}: {cat.values.join(', ')}
                    </Text>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={() => setVariantModalVisible(true)}
                className="bg-pink-500 rounded-xl py-3 items-center flex-row justify-center"
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-semibold text-sm ml-2">
                  {variantCategories.length > 0 ? 'Edit Variants' : 'Add Variants'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-sm text-gray-600">
              Enable variants to create different options for this product (e.g., colors, sizes).
            </Text>
          )}
        </View>

        {/* Description */}
        <View className="mt-5 mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Description
          </Text>
          <TextInput
            ref={productDescriptionRef}
            className={`bg-gray-50 rounded-xl px-4 py-4 text-gray-900 text-base border ${fieldErrors.productDescription ? 'border-red-500' : 'border-gray-200'
              }`}
            placeholder="Tell us more about this product..."
            value={productDescription}
            onChangeText={(text) => {
              setProductDescription(text);
              setFieldErrors(prev => ({ ...prev, productDescription: false }));
            }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
            style={{ minHeight: 100 }}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-xl py-4 items-center justify-center ${loading ? 'bg-gray-300' : 'bg-pink-500'
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

      {/* Variant Modal */}
      <VariantModal
        visible={variantModalVisible}
        onClose={() => setVariantModalVisible(false)}
        onSave={handleSaveVariants}
        initialCategories={variantCategories}
        initialVariants={variants}
        basePrice={Number(productPrice) || 0}
      />

      {/* Toast */}
      <GeneralToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default ProductScreen;