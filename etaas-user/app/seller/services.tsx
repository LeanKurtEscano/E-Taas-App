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
import { useOfferService } from '@/hooks/seller/useOfferService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import useToast from '@/hooks/general/useToast';
import CheckoutToast from '@/components/general/CheckOutToast';
import { Ionicons } from '@expo/vector-icons';

const OfferServiceScreen = () => {
  const { userData } = useCurrentUser();
  const { toastVisible, toastMessage, toastType, showToast, setToastVisible } = useToast();
  
  const {
    formData,
    loading,
    uploadingImages,
    categories,
    updateField,
    selectCategory,
    pickImages,
    removeImage,
    submitService,
  } = useOfferService({ userId: userData?.uid || '', showToast });

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Header */}
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Offer a Service
          </Text>
          <Text className="text-gray-500 mb-6">
            Fill in the details to list your service
          </Text>

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
              Price Range (Optional)
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
              Facebook Page / Link
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
          <View className="mb-6 flex-row items-center justify-between bg-gray-50 rounded-2xl px-4 py-4">
            <Text className="text-sm font-semibold text-gray-700">
              Currently Available
            </Text>
            <Switch
              value={formData.availability}
              onValueChange={(value) => updateField('availability', value)}
              trackColor={{ false: '#d1d5db', true: '#ec4899' }}
              thumbColor={formData.availability ? '#fff' : '#f3f4f6'}
            />
          </View>

          {/* Upload Images */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Service Images (Up to 3)
            </Text>
            <View className="flex-row gap-3">
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
                  {index === 2 && formData.images.length > 3 && (
                    <View className="absolute inset-0 bg-black/50 rounded-2xl items-center justify-center">
                      <Text className="text-white font-bold text-lg">
                        3+
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              {formData.images.length < 3 && (
                <TouchableOpacity
                  onPress={pickImages}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50 items-center justify-center"
                >
                  <Ionicons name="camera" size={32} color="#ec4899" />
                  <Text className="text-xs text-pink-500 mt-1">Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={submitService}
            disabled={loading || uploadingImages}
            className={`rounded-2xl py-4 items-center ${
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
                  {uploadingImages ? 'Uploading Images...' : 'Submitting...'}
                </Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-lg">
                Submit Service
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