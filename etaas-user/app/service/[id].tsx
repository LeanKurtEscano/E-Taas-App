import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useInquiries } from '@/hooks/general/useInquiries';
import CheckoutToast from '@/components/general/CheckOutToast';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import ChatButton from '@/components/general/ChatButton';
import AssistantChatModal from '@/components/general/AssistantChatModal';

const InquireServiceScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceId = params.id as string;
  const [isAssistantModalVisible, setAssistantModalVisible] = useState(false);
  
  // Use dynamic dimensions for real-time responsiveness
  const { width, height } = useWindowDimensions();
  
  // Calculate responsive values
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 768;
  const isTablet = width >= 768;
  
  const imageHeight = isTablet ? 400 : isSmallDevice ? 250 : 300;
  const horizontalPadding = isTablet ? 32 : isSmallDevice ? 16 : 24;
  
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

  const handleScroll = useCallback((e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(index);
  }, [width, setCurrentImageIndex]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text 
            className="text-gray-600 mt-4 text-center"
            style={{ 
              fontSize: isSmallDevice ? 14 : 16,
              paddingHorizontal: horizontalPadding 
            }}
          >
            Loading service details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Ionicons 
            name="alert-circle-outline" 
            size={isSmallDevice ? 48 : 64} 
            color="#d1d5db" 
          />
          <Text 
            className="text-gray-400 font-semibold mt-4"
            style={{ fontSize: isSmallDevice ? 16 : 18 }}
          >
            Service not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View 
          className="flex-row items-center bg-white border-b border-gray-100"
          style={{ 
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallDevice ? 8 : 12,
            paddingBottom: isSmallDevice ? 12 : 16 
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 rounded-full"
            style={{ marginRight: isSmallDevice ? 8 : 16 }}
          >
            <Ionicons 
              name="arrow-back" 
              size={isSmallDevice ? 20 : 24} 
              color="#374151" 
            />
          </TouchableOpacity>
          <View className="flex-1">
            <Text 
              className="font-bold text-gray-800"
              style={{ fontSize: isTablet ? 28 : isSmallDevice ? 18 : 24 }}
            >
              Inquire Service
            </Text>
            <Text 
              className="text-gray-500 mt-1"
              style={{ fontSize: isSmallDevice ? 11 : 14 }}
            >
              Send your inquiry to the service provider
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: isTablet ? 32 : 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Gallery */}
          <View className="relative">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {allImages.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{ width, height: imageHeight }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Image Indicators */}
            {allImages.length > 1 && (
              <View 
                className="absolute left-0 right-0 flex-row justify-center"
                style={{ 
                  bottom: isSmallDevice ? 12 : 16,
                  gap: isSmallDevice ? 6 : 8 
                }}
              >
                {allImages.map((_, index) => (
                  <View
                    key={index}
                    style={{
                      height: isSmallDevice ? 6 : 8,
                      width: index === currentImageIndex 
                        ? (isSmallDevice ? 20 : 24) 
                        : (isSmallDevice ? 6 : 8),
                      borderRadius: 4,
                      backgroundColor: index === currentImageIndex 
                        ? '#ec4899' 
                        : 'rgba(255, 255, 255, 0.6)',
                    }}
                  />
                ))}
              </View>
            )}

            {/* Badges */}
            <View 
              className="absolute left-4 right-4 flex-row justify-between"
              style={{ 
                top: isSmallDevice ? 12 : 16,
                left: horizontalPadding,
                right: horizontalPadding 
              }}
            >
              <View className="bg-pink-500 px-3 py-1.5 rounded-full">
                <Text 
                  className="text-white font-semibold"
                  style={{ fontSize: isSmallDevice ? 10 : 12 }}
                >
                  {service.category}
                </Text>
              </View>
              <View
                className={`px-3 py-1.5 rounded-full ${
                  service.availability ? 'bg-green-500' : 'bg-gray-500'
                }`}
              >
                <Text 
                  className="text-white font-semibold"
                  style={{ fontSize: isSmallDevice ? 10 : 12 }}
                >
                  {service.availability ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>
          </View>

          {/* Service Information */}
          <View style={{ paddingHorizontal: horizontalPadding, paddingTop: isTablet ? 32 : 24 }}>
            {/* Title Section */}
            <View style={{ marginBottom: isTablet ? 32 : 24 }}>
              <Text 
                className="font-bold text-gray-800 mb-2"
                style={{ 
                  fontSize: isTablet ? 36 : isSmallDevice ? 24 : 30,
                  lineHeight: isTablet ? 44 : isSmallDevice ? 32 : 38
                }}
              >
                {service.serviceName}
              </Text>
              <Text 
                className="text-gray-600"
                style={{ fontSize: isSmallDevice ? 14 : 18 }}
              >
                {service.businessName}
              </Text>
            </View>

            {/* Info Cards */}
            <View style={{ marginBottom: isTablet ? 32 : 24, gap: 12 }}>
              <View className="flex-row items-center bg-gray-50 rounded-2xl p-4">
                <View 
                  className="bg-pink-100 rounded-full mr-4"
                  style={{ padding: isSmallDevice ? 10 : 12 }}
                >
                  <Ionicons 
                    name="person" 
                    size={isSmallDevice ? 18 : 20} 
                    color="#ec4899" 
                  />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-gray-500 mb-1"
                    style={{ fontSize: isSmallDevice ? 10 : 12 }}
                  >
                    Owner
                  </Text>
                  <Text 
                    className="font-semibold text-gray-800"
                    style={{ fontSize: isSmallDevice ? 14 : 16 }}
                  >
                    {service.ownerName}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center bg-gray-50 rounded-2xl p-4">
                <View 
                  className="bg-pink-100 rounded-full mr-4"
                  style={{ padding: isSmallDevice ? 10 : 12 }}
                >
                  <Ionicons 
                    name="call" 
                    size={isSmallDevice ? 18 : 20} 
                    color="#ec4899" 
                  />
                </View>
                <View className="flex-1">
                  <Text 
                    className="text-gray-500 mb-1"
                    style={{ fontSize: isSmallDevice ? 10 : 12 }}
                  >
                    Contact Number
                  </Text>
                  <Text 
                    className="font-semibold text-gray-800"
                    style={{ fontSize: isSmallDevice ? 14 : 16 }}
                  >
                    {service.contactNumber}
                  </Text>
                </View>
              </View>

              {service.address && (
                <View className="flex-row items-center bg-gray-50 rounded-2xl p-4">
                  <View 
                    className="bg-pink-100 rounded-full mr-4"
                    style={{ padding: isSmallDevice ? 10 : 12 }}
                  >
                    <Ionicons 
                      name="location" 
                      size={isSmallDevice ? 18 : 20} 
                      color="#ec4899" 
                    />
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-gray-500 mb-1"
                      style={{ fontSize: isSmallDevice ? 10 : 12 }}
                    >
                      Address
                    </Text>
                    <Text 
                      className="font-semibold text-gray-800"
                      style={{ fontSize: isSmallDevice ? 14 : 16 }}
                    >
                      {service.address}
                    </Text>
                  </View>
                </View>
              )}

              {service.priceRange && (
                <View className="flex-row items-center bg-pink-50 rounded-2xl p-4 border border-pink-200">
                  <View 
                    className="bg-pink-500 rounded-full mr-4"
                    style={{ padding: isSmallDevice ? 10 : 12 }}
                  >
                    <Ionicons 
                      name="pricetag" 
                      size={isSmallDevice ? 18 : 20} 
                      color="white" 
                    />
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-pink-600 mb-1"
                      style={{ fontSize: isSmallDevice ? 10 : 12 }}
                    >
                      Price Range
                    </Text>
                    <Text 
                      className="font-bold text-pink-600"
                      style={{ fontSize: isSmallDevice ? 14 : 16 }}
                    >
                      {service.priceRange}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={{ marginBottom: isTablet ? 32 : 24 }}>
              <Text 
                className="font-bold text-gray-800 mb-3"
                style={{ fontSize: isSmallDevice ? 16 : 18 }}
              >
                About This Service
              </Text>
              <Text 
                className="text-gray-600"
                style={{ 
                  fontSize: isSmallDevice ? 14 : 16,
                  lineHeight: isSmallDevice ? 20 : 24 
                }}
              >
                {service.serviceDescription}
              </Text>
            </View>

            {/* Owner Actions or Inquiry Form */}
            {isOwner ? (
              <View style={{ marginBottom: isTablet ? 32 : 24 }}>
                <View className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-3xl p-6 mb-4 border border-pink-100">
                  <View className="flex-row items-center mb-4">
                    <View className="bg-pink-500 p-2 rounded-full mr-3">
                      <Ionicons 
                        name="business" 
                        size={isSmallDevice ? 18 : 20} 
                        color="white" 
                      />
                    </View>
                    <View className="flex-1">
                      <Text 
                        className="font-bold text-gray-800"
                        style={{ fontSize: isSmallDevice ? 16 : 18 }}
                      >
                        You own this service
                      </Text>
                      <Text 
                        className="text-gray-600 mt-0.5"
                        style={{ fontSize: isSmallDevice ? 12 : 14 }}
                      >
                        Manage your service and view customer inquiries
                      </Text>
                    </View>
                  </View>
                </View>

                <View 
                  style={{ 
                    flexDirection: isTablet ? 'row' : 'column',
                    gap: 12 
                  }}
                >
                  <TouchableOpacity
                    onPress={() => router.push(`/seller/services?serviceId=${serviceId}`)}
                    className="bg-pink-500 rounded-2xl py-4 flex-row items-center justify-center"
                    style={{
                      flex: isTablet ? 1 : undefined,
                      shadowColor: '#ec4899',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    <Ionicons 
                      name="create-outline" 
                      size={isSmallDevice ? 18 : 20} 
                      color="white" 
                    />
                    <Text 
                      className="text-white font-bold ml-2"
                      style={{ fontSize: isSmallDevice ? 14 : 16 }}
                    >
                      Edit Service
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/seller/inquiries/${serviceId}`)}
                    className="bg-blue-500 rounded-2xl py-4 flex-row items-center justify-center"
                    style={{
                      flex: isTablet ? 1 : undefined,
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    <Ionicons 
                      name="mail-outline" 
                      size={isSmallDevice ? 18 : 20} 
                      color="white" 
                    />
                    <Text 
                      className="text-white font-bold ml-2"
                      style={{ fontSize: isSmallDevice ? 14 : 16 }}
                    >
                      Inquiries
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Inquiry Form */}
                <View style={{ marginBottom: isTablet ? 32 : 24 }}>
                  <Text 
                    className="font-bold text-gray-800 mb-4"
                    style={{ fontSize: isSmallDevice ? 16 : 18 }}
                  >
                    Submit Your Inquiry
                  </Text>

                  <View style={{ gap: 16 }}>
                    <View>
                      <Text 
                        className="font-semibold text-gray-700 mb-2"
                        style={{ fontSize: isSmallDevice ? 12 : 14 }}
                      >
                        Your Name *
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
                        style={{ fontSize: isSmallDevice ? 14 : 16 }}
                        placeholder="Enter your full name"
                        value={inquiryData.customerName}
                        onChangeText={(text) => updateInquiryData('customerName', text)}
                      />
                    </View>

                    <View>
                      <Text 
                        className="font-semibold text-gray-700 mb-2"
                        style={{ fontSize: isSmallDevice ? 12 : 14 }}
                      >
                        Email <Text className="text-gray-400 font-normal">(Optional)</Text>
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
                        style={{ fontSize: isSmallDevice ? 14 : 16 }}
                        placeholder="your.email@example.com"
                        value={inquiryData.customerEmail}
                        onChangeText={(text) => updateInquiryData('customerEmail', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>

                    <View>
                      <Text 
                        className="font-semibold text-gray-700 mb-2"
                        style={{ fontSize: isSmallDevice ? 12 : 14 }}
                      >
                        Phone Number *
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
                        style={{ fontSize: isSmallDevice ? 14 : 16 }}
                        placeholder="0912-345-6789"
                        value={inquiryData.customerPhone}
                        onChangeText={(text) => updateInquiryData('customerPhone', text)}
                        keyboardType="phone-pad"
                      />
                    </View>

                    <View>
                      <Text 
                        className="font-semibold text-gray-700 mb-2"
                        style={{ fontSize: isSmallDevice ? 12 : 14 }}
                      >
                        Your Message *
                      </Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800"
                        style={{ 
                          fontSize: isSmallDevice ? 14 : 16,
                          minHeight: isSmallDevice ? 100 : 120 
                        }}
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
              </>
            )}
          </View>
        </ScrollView>

        {isOwner ? null : (
          <View 
            className="bg-white border-t border-gray-200"
            style={{ 
              paddingHorizontal: horizontalPadding,
              paddingVertical: isSmallDevice ? 12 : 16,
              paddingBottom: Platform.OS === 'ios' ? isSmallDevice ? 12 : 16 : 16
            }}
          >
            <TouchableOpacity
              onPress={handleSubmitInquiry}
              disabled={submitting}
              className={`rounded-2xl py-4 items-center ${
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
                  <ActivityIndicator color="white" size={isSmallDevice ? "small" : "large"} />
                  <Text 
                    className="text-white font-bold ml-2"
                    style={{ fontSize: isSmallDevice ? 14 : 18 }}
                  >
                    Submitting...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Ionicons 
                    name="send" 
                    size={isSmallDevice ? 18 : 20} 
                    color="white" 
                  />
                  <Text 
                    className="text-white font-bold ml-2"
                    style={{ fontSize: isSmallDevice ? 14 : 18 }}
                  >
                    Submit Inquiry
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        
        {/*  
         <ChatButton 
          onPress={() => setAssistantModalVisible(true)} 
          bottomOffset={isTablet ? 120 : 100} 
        />
        
        
        <AssistantChatModal
          visible={isAssistantModalVisible}
          onClose={() => setAssistantModalVisible(false)}
          userId={userData?.uid}
          shopId={service.shopId}
        />

       
       */}

        <ChatButton 
          onPress={() => setAssistantModalVisible(true)} 
          bottomOffset={isTablet ? 120 : 100} 
        />
        
        
        <AssistantChatModal
          visible={isAssistantModalVisible}
          onClose={() => setAssistantModalVisible(false)}
          userId={userData?.uid}
          shopId={service.shopId}
        />
        
        <CheckoutToast
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
          message={toastMessage}
          type={toastType}
        />

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InquireServiceScreen;