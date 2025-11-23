import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useInquiries } from '@/hooks/general/useInquiries';
import CheckoutToast from '@/components/general/CheckOutToast';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import ChatButton from '@/components/general/ChatButton';
import AssistantChatModal from '@/components/general/AssistantChatModal';

const { width } = Dimensions.get('window');

const InquireServiceScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceId = params.id as string;
  const [isAssistantModalVisible, setAssistantModalVisible] = useState(false);
  const {
    service,
    loading,
    submitting,
    currentImageIndex,
    inquiryData,
    allImages,
    isOwner,
    toastVisible,
    toastMessage,
    toastType,
    setToastVisible,
    setCurrentImageIndex,
    updateInquiryData,
    submitInquiry,
    userData
  } = useInquiries(serviceId);

  const handleSubmitInquiry = async () => {
    const success = await submitInquiry();
    if (success) {
      setTimeout(() => {
        router.back();
      }, 1500);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="text-gray-600 mt-4">Loading service details...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color="#d1d5db" />
        <Text className="text-gray-400 text-lg font-semibold mt-4">
          Service not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-12 pb-4 bg-white border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-4 p-2 rounded-full "
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800">
            Inquire Service
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Send your inquiry to the service provider
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Image Gallery */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {allImages.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width, height: 300 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          {allImages.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {allImages.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${
                    index === currentImageIndex
                      ? 'w-6 bg-pink-500'
                      : 'w-2 bg-white opacity-60'
                  }`}
                />
              ))}
            </View>
          )}

          {/* Badges */}
          <View className="absolute top-4 left-4 right-4 flex-row justify-between">
            <View className="bg-pink-500 px-3 py-1.5 rounded-full">
              <Text className="text-white text-xs font-semibold">
                {service.category}
              </Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-full ${
                service.availability ? 'bg-green-500' : 'bg-gray-500'
              }`}
            >
              <Text className="text-white text-xs font-semibold">
                {service.availability ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Information */}
        <View className="px-6 pt-6">
          {/* Title Section */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              {service.serviceName}
            </Text>
            <Text className="text-lg text-gray-600">
              {service.businessName}
            </Text>
          </View>

          {/* Info Cards */}
          <View className="mb-6 space-y-3">
            <View className="flex-row items-center bg-gray-50 rounded-2xl p-4">
              <View className="bg-pink-100 p-3 rounded-full mr-4">
                <Ionicons name="person" size={20} color="#ec4899" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Owner</Text>
                <Text className="text-base font-semibold text-gray-800">
                  {service.ownerName}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-gray-50 rounded-2xl p-4">
              <View className="bg-pink-100 p-3 rounded-full mr-4">
                <Ionicons name="call" size={20} color="#ec4899" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">Contact Number</Text>
                <Text className="text-base font-semibold text-gray-800">
                  {service.contactNumber}
                </Text>
              </View>
            </View>

            {service.address && (
              <View className="flex-row items-center bg-gray-50 rounded-2xl p-4">
                <View className="bg-pink-100 p-3 rounded-full mr-4">
                  <Ionicons name="location" size={20} color="#ec4899" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">Address</Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {service.address}
                  </Text>
                </View>
              </View>
            )}

            {service.priceRange && (
              <View className="flex-row items-center bg-pink-50 rounded-2xl p-4 border border-pink-200">
                <View className="bg-pink-500 p-3 rounded-full mr-4">
                  <Ionicons name="pricetag" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-pink-600 mb-1">Price Range</Text>
                  <Text className="text-base font-bold text-pink-600">
                    {service.priceRange}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              About This Service
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              {service.serviceDescription}
            </Text>
          </View>

          {/* Owner Actions or Inquiry Form */}
          {isOwner ? (
            <View className="mb-6">
              <View className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-3xl p-6 mb-4 border border-pink-100">
                <View className="flex-row items-center mb-4">
                  <View className="bg-pink-500 p-2 rounded-full mr-3">
                    <Ionicons name="business" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">
                      You own this service
                    </Text>
                    <Text className="text-sm text-gray-600 mt-0.5">
                      Manage your service and view customer inquiries
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => router.push(`/seller/services?serviceId=${serviceId}`)}

                  className="flex-1 bg-pink-500 rounded-2xl py-4 flex-row items-center justify-center"
                  style={{
                    shadowColor: '#ec4899',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="create-outline" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Edit Service
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push(`/seller/inquiries/${serviceId}`)}
                  className="flex-1 bg-blue-500 rounded-2xl py-4 flex-row items-center justify-center"
                  style={{
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="mail-outline" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Inquiries
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Inquiry Form */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-gray-800 mb-4">
                  Submit Your Inquiry
                </Text>

                <View className="space-y-4">
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Your Name *
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
                      placeholder="Enter your full name"
                      value={inquiryData.customerName}
                      onChangeText={(text) => updateInquiryData('customerName', text)}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Email <Text className="text-gray-400 font-normal">(Optional)</Text>
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
                      placeholder="your.email@example.com"
                      value={inquiryData.customerEmail}
                      onChangeText={(text) => updateInquiryData('customerEmail', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
                      placeholder="0912-345-6789"
                      value={inquiryData.customerPhone}
                      onChangeText={(text) => updateInquiryData('customerPhone', text)}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      Your Message *
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
                      placeholder="Tell us about your inquiry, questions, or requirements..."
                      value={inquiryData.message}
                      onChangeText={(text) => updateInquiryData('message', text)}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitInquiry}
                disabled={submitting}
                className={`rounded-2xl py-4 items-center mb-6 ${
                  submitting ? 'bg-pink-300' : 'bg-pink-500'
                }`}
                style={{
                  shadowColor: '#ec4899',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                {submitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Submitting...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Ionicons name="send" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Submit Inquiry
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <ChatButton onPress={() => setAssistantModalVisible(true)} bottomOffset={100}/>

      <AssistantChatModal
        visible={isAssistantModalVisible}
        onClose={() => setAssistantModalVisible(false)}
        userId={userData?.uid}
        shopId={service.shopId}
      />
 

      {/* Toast Notification     */}
      <CheckoutToast 
        visible={toastVisible} 
        onHide={() => setToastVisible(false)} 
        message={toastMessage} 
        type={toastType} 
      />
    </View>
  );
};

export default InquireServiceScreen;