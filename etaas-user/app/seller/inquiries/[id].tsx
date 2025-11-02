import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useServiceInquiries } from '@/hooks/seller/useServiceInquiries';
import CheckoutToast from '@/components/general/CheckOutToast';
import { Ionicons } from '@expo/vector-icons';

const ServiceInquiriesScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceId = params.id as string;

  const {
    inquiries,
    service,
    loading,
    refreshing,
    deleting,
    toastVisible,
    toastMessage,
    toastType,
    setToastVisible,
    onRefresh,
    deleteInquiry,
  } = useServiceInquiries(serviceId);

  const handleDeleteInquiry = (inquiryId: string, customerName: string) => {
    Alert.alert(
      'Delete Inquiry',
      `Are you sure you want to delete the inquiry from ${customerName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteInquiry(inquiryId),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="text-gray-600 mt-4">Loading inquiries...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">
              Inquiries
            </Text>
            {service && (
              <Text className="text-sm text-gray-500 mt-1">
                {service.serviceName}
              </Text>
            )}
          </View>
        </View>

        {/* Stats Card */}
        <View className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mt-2 border border-pink-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-pink-500 p-2.5 rounded-full mr-3">
                <Ionicons name="mail" size={20} color="white" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  {inquiries.length}
                </Text>
                <Text className="text-xs text-gray-600">
                  Total Inquiries
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onRefresh}
              className="bg-white p-2 rounded-full"
            >
              <Ionicons name="refresh" size={20} color="#ec4899" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Inquiries List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ec4899"
            colors={['#ec4899']}
          />
        }
      >
        {inquiries.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="bg-gray-100 p-6 rounded-full mb-4">
              <Ionicons name="mail-open-outline" size={64} color="#d1d5db" />
            </View>
            <Text className="text-gray-400 text-lg font-semibold">
              No inquiries yet
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-8">
              When customers inquire about your service, they'll appear here
            </Text>
          </View>
        ) : (
          inquiries.map((inquiry) => (
            <View
              key={inquiry.id}
              className="mb-4 bg-white border border-gray-300 rounded-3xl overflow-hidden"
             
            >
              {/* Header */}
              <View className="bg-gradient-to-r from-pink-500 to-purple-500 p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="person-circle" size={20} color="white" />
                      <Text className="text-white font-bold text-lg ml-2">
                        {inquiry.customerName}
                      </Text>
                    </View>
                    <Text className="text-white text-xs opacity-90">
                      {formatDate(inquiry.createdAt)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-white/20 px-3 py-1.5 rounded-full">
                      <Text className="text-white text-xs font-semibold">
                        {inquiry.status}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteInquiry(inquiry.id, inquiry.customerName)}
                      disabled={deleting === inquiry.id}
                      className="bg-red-500 p-2 rounded-full"
                      style={{
                        width: 36,
                        height: 36,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {deleting === inquiry.id ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Ionicons name="trash" size={18} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Content */}
              <View className="p-4">
                {/* Contact Info */}
                <View className="mb-4 space-y-2">
                  <View className="flex-row items-center">
                    <View className="bg-pink-100 p-2 rounded-full mr-3">
                      <Ionicons name="call" size={16} color="#ec4899" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 mb-0.5">Phone</Text>
                      <Text className="text-sm font-semibold text-gray-800">
                        {inquiry.customerPhone}
                      </Text>
                    </View>
                  </View>

                  {inquiry.customerEmail && (
                    <View className="flex-row items-center">
                      <View className="bg-pink-100 p-2 rounded-full mr-3">
                        <Ionicons name="mail" size={16} color="#ec4899" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 mb-0.5">Email</Text>
                        <Text className="text-sm font-semibold text-gray-800">
                          {inquiry.customerEmail}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Message */}
                <View className="bg-gray-50 rounded-2xl p-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="chatbubble-ellipses" size={16} color="#6b7280" />
                    <Text className="text-xs font-semibold text-gray-600 ml-1.5">
                      MESSAGE
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-700 leading-5">
                    {inquiry.message}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
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

export default ServiceInquiriesScreen;