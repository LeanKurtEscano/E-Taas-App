import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useOfferService } from '@/hooks/seller/useOfferService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import useToast from '@/hooks/general/useToast';
import CheckoutToast from '@/components/general/CheckOutToast';
import { Ionicons } from '@expo/vector-icons';

const OfferServiceScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceId = params.serviceId as string | undefined;
  
  const { userData } = useCurrentUser();
  const { toastVisible, toastMessage, toastType, showToast, setToastVisible } = useToast();
  
  const {
    formData,
    loading,
    uploadingImages,
    fetchingService,
    isEditMode,
    categories,
    updateField,
    selectCategory,
    pickBannerImage,
    removeBannerImage,
    pickImages,
    removeImage,
    submitService,
  } = useOfferService({ 
    userId: userData?.uid || '', 
    serviceId,
    showToast 
  });

  const handleSubmit = async () => {
    await submitService();
    if (isEditMode) {
      router.back();
    }
  };

  if (fetchingService) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="text-gray-600 mt-4">Loading service data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with Back Button */}
      <View className="flex-row items-center px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4 p-2 rounded-full "
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800">
            {isEditMode ? 'Edit Service' : 'Offer a Service'}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {isEditMode 
              ? 'Update your service details' 
              : 'Fill in the details to list your service'}
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-6 pt-6">
          {/* Banner Image Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Banner Image * <Text className="text-gray-500 font-normal">(1 image)</Text>
            </Text>
            <Text className="text-xs text-gray-500 mb-3">
              Upload a high-quality banner image to showcase your service
            </Text>
            
            {formData.bannerImage ? (
              <View className="relative">
                <Image
                  source={{ uri: formData.bannerImage }}
                  className="w-full h-48 rounded-2xl"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={removeBannerImage}
                  className="absolute top-3 right-3 bg-red-500 rounded-full p-2"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickBannerImage}
                className="w-full h-48 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50 items-center justify-center"
              >
                <Ionicons name="image-outline" size={48} color="#ec4899" />
                <Text className="text-pink-500 font-semibold mt-3">
                  Upload Banner Image
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  Recommended: 16:9 aspect ratio
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Service Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Service Name *
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="e.g., Home Cleaning Service"
              value={formData.serviceName}
              onChangeText={(text) => updateField('serviceName', text)}
            />
          </View>

          {/* Business Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Business Name *
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="e.g., Clean & Fresh Services"
              value={formData.businessName}
              onChangeText={(text) => updateField('businessName', text)}
            />
          </View>

          {/* Owner Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Owner Name *
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="Your full name"
              value={formData.ownerName}
              onChangeText={(text) => updateField('ownerName', text)}
            />
          </View>

          {/* Contact Number */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Contact Number *
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="0912-345-6789"
              value={formData.contactNumber}
              onChangeText={(text) => updateField('contactNumber', text)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Address
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="Full business address"
              value={formData.address}
              onChangeText={(text) => updateField('address', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Category *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => selectCategory(cat)}
                  className={`px-4 py-2 rounded-full border ${
                    formData.category === cat
                      ? 'bg-pink-500 border-pink-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      formData.category === cat
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Service Description */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Service Description *
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="Describe your service in detail..."
              value={formData.serviceDescription}
              onChangeText={(text) => updateField('serviceDescription', text)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Price Range */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Price Range <Text className="text-gray-400 font-normal">(Optional)</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="e.g., ₱500 - ₱1,000"
              value={formData.priceRange}
              onChangeText={(text) => updateField('priceRange', text)}
            />
          </View>

          {/* Facebook Link */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Facebook Page / Link <Text className="text-gray-400 font-normal">(Optional)</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
              placeholder="https://facebook.com/yourpage"
              value={formData.facebookLink}
              onChangeText={(text) => updateField('facebookLink', text)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Availability Toggle */}
          <View className="mb-6 flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700">
                Currently Available
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                Toggle to show if you're accepting inquiries
              </Text>
            </View>
            <Switch
              value={formData.availability}
              onValueChange={(value) => updateField('availability', value)}
              trackColor={{ false: '#d1d5db', true: '#ec4899' }}
              thumbColor={formData.availability ? '#fff' : '#f3f4f6'}
            />
          </View>

          {/* Upload Service Images */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Service Images <Text className="text-gray-500 font-normal">(Up to 3)</Text>
            </Text>
            <Text className="text-xs text-gray-500 mb-3">
              Add additional photos to showcase your service details
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {formData.images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-24 h-24 rounded-2xl"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              {formData.images.length < 3 && (
                <TouchableOpacity
                  onPress={pickImages}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center"
                >
                  <Ionicons name="camera" size={28} color="#9ca3af" />
                  <Text className="text-xs text-gray-500 mt-1">Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || uploadingImages}
            className={`rounded-2xl py-4 items-center mb-6 ${
              loading || uploadingImages ? 'bg-pink-300' : 'bg-pink-500'
            }`}
            style={{
              shadowColor: '#ec4899',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {loading || uploadingImages ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  {uploadingImages ? 'Uploading Images...' : isEditMode ? 'Updating...' : 'Submitting...'}
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-lg">
                {isEditMode ? 'Update Service' : 'Submit Service'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <CheckoutToast 
        visible={toastVisible} 
        onHide={() => setToastVisible(false)} 
        message={toastMessage} 
        type={toastType} 
      />
    </View>
  );
};

export default OfferServiceScreen;