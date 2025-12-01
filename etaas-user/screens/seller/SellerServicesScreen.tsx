import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import CheckoutToast from '@/components/general/CheckOutToast';
import { ingestApi } from '@/config/apiConfig';
interface Service {
  id: string;
  serviceName: string;
  serviceDescription: string;
  category: string;
  priceRange: string;
  images: string[];
  bannerImage: string;
  availability: boolean;
  address: string;
  businessName: string;
  contactNumber: string;
  ownerName: string;
  inquiryCount?: number;
}

const ManageInquiriesScreen = () => {
  const router = useRouter();
  const { userData } = useCurrentUser();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const fetchServices = async () => {
    if (!userData?.uid) return;

    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, where('userId', '==', userData.uid));
      const querySnapshot = await getDocs(q);

      const servicesData: Service[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const serviceData = { id: docSnap.id, ...docSnap.data() } as Service;
    
        const inquiriesRef = collection(db, 'inquiries');
        const inquiriesQuery = query(inquiriesRef, where('serviceId', '==', serviceData.id));
        const inquiriesSnapshot = await getDocs(inquiriesQuery);
        serviceData.inquiryCount = inquiriesSnapshot.size;
        
        servicesData.push(serviceData);
      }

      setServices(servicesData);
    } catch (error) {
   
      setToastMessage('Failed to load services');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingServiceId(serviceId);
            try {
              await deleteDoc(doc(db, 'services', serviceId));
              const response = await ingestApi.delete(`/shops/${userData?.sellerInfo.sellerId}/service/${serviceId}`);
              setServices(services.filter(service => service.id !== serviceId));
              
              setToastMessage('Service deleted successfully');
              setToastType('success');
              setToastVisible(true);
            } catch (error) {
            
              setToastMessage('Failed to delete service');
              setToastType('error');
              setToastVisible(true);
            } finally {
              setDeletingServiceId(null);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchServices();
  }, [userData?.uid]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="text-gray-600 mt-4">Loading services...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-800">
              Manage Inquiries
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              View and manage service inquiries
            </Text>
          </View>
          
          {/* Add Service Button */}
          <TouchableOpacity
            onPress={() => router.push('/seller/services')}
            className="bg-pink-500 rounded-xl py-3 px-4 flex-row items-center ml-3"
            style={{
              shadowColor: '#ec4899',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text className="text-white font-bold text-sm ml-2">
              Add Service
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mt-2 border border-pink-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-pink-500 p-2.5 rounded-full mr-3">
                <Ionicons name="briefcase" size={20} color="white" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  {services.length}
                </Text>
                <Text className="text-xs text-gray-600">
                  Active Services
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="bg-purple-500 p-2.5 rounded-full mr-3">
                <Ionicons name="mail" size={20} color="white" />
              </View>
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  {services.reduce((sum, service) => sum + (service.inquiryCount || 0), 0)}
                </Text>
                <Text className="text-xs text-gray-600">
                  Total Inquiries
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onRefresh}
              className="bg-white p-2 rounded-full"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons name="refresh" size={20} color="#ec4899" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Services List */}
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
        {services.length === 0 ? (
          <View className="items-center justify-center py-16">
            <View className="bg-gray-100 p-6 rounded-full mb-4">
              <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            </View>
            <Text className="text-gray-400 text-lg font-semibold">
              No services yet
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-8">
              Create your first service to start receiving inquiries
            </Text>
          </View>
        ) : (
          services.map((service) => (
            <View
              key={service.id}
              className="mb-4 bg-white border border-gray-300 rounded-3xl overflow-hidden"
            >
              {/* Banner Image */}
              {service.bannerImage ? (
                <View className="relative">
                  <Image
                    source={{ uri: service.bannerImage }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />
                  {/* Gradient Overlay */}
                  <View 
                    className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"
                  />
                  
                  {/* Delete Button on Banner */}
                  <View className="absolute top-4 right-4">
                    <TouchableOpacity
                      onPress={() => handleDeleteService(service.id, service.serviceName)}
                      disabled={deletingServiceId === service.id}
                      className="bg-red-500 p-2.5 rounded-full"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                      }}
                    >
                      {deletingServiceId === service.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="trash" size={18} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Inquiry Badge on Banner */}
                  <View className="absolute bottom-4 left-4">
                    <View 
                      className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full flex-row items-center"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <View className="bg-pink-500 p-1.5 rounded-full mr-2">
                        <Ionicons name="mail" size={12} color="white" />
                      </View>
                      <Text className="text-sm font-bold text-gray-800">
                        {service.inquiryCount || 0}
                      </Text>
                      <Text className="text-xs text-gray-600 ml-1">
                        {service.inquiryCount === 1 ? 'Inquiry' : 'Inquiries'}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="relative">
                  <View className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 items-center justify-center">
                    <Ionicons name="image-outline" size={64} color="#d1d5db" />
                  </View>
                  
                  {/* Delete Button for no banner */}
                  <View className="absolute top-4 right-4">
                    <TouchableOpacity
                      onPress={() => handleDeleteService(service.id, service.serviceName)}
                      disabled={deletingServiceId === service.id}
                      className="bg-red-500 p-2.5 rounded-full"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                      }}
                    >
                      {deletingServiceId === service.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="trash" size={18} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Service Details */}
              <View className="p-5">
                {/* Business Name & Service Name */}
                <View className="mb-3">
                  <Text className="text-xl font-bold text-gray-800 mb-1">
                    {service.businessName}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {service.serviceName}
                  </Text>
                </View>

                {/* Category */}
                <View className="flex-row items-center mb-3">
                  <View className="bg-pink-100 p-2 rounded-lg mr-2">
                    <Ionicons name="pricetag" size={14} color="#ec4899" />
                  </View>
                  <Text className="text-sm font-semibold text-gray-700">
                    {service.category}
                  </Text>
                </View>

                {/* Price Range */}
                {service.priceRange && service.priceRange.trim() !== '' && (
                  <View className="flex-row items-center mb-3">
                    <View className="bg-green-100 p-2 rounded-lg mr-2">
                      <Ionicons name="cash" size={14} color="#10b981" />
                    </View>
                    <Text className="text-sm font-semibold text-gray-700">
                      {service.priceRange}
                    </Text>
                  </View>
                )}

                {/* Address */}
                {service.address && (
                  <View className="flex-row items-start mb-4">
                    <View className="bg-blue-100 p-2 rounded-lg mr-2 mt-0.5">
                      <Ionicons name="location" size={14} color="#3b82f6" />
                    </View>
                    <Text className="text-sm pt-2 text-gray-600 flex-1" numberOfLines={2}>
                      {service.address}
                    </Text>
                  </View>
                )}

                {/* Description */}
                {service.serviceDescription && (
                  <View className="bg-gray-50 rounded-xl p-3 mb-4">
                    <Text className="text-xs text-gray-600 leading-5" numberOfLines={3}>
                      {service.serviceDescription}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => router.push(`/seller/services?serviceId=${service.id}`)}
                    className="flex-1 bg-purple-500 rounded-xl py-3.5 flex-row items-center justify-center"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                  >
                    <Ionicons name="create" size={18} color="#fff" />
                    <Text className="text-white font-bold text-sm ml-2">
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push(`/seller/inquiries/${service.id}`)}
                    className="flex-1 bg-pink-500 rounded-xl py-3.5 flex-row items-center justify-center"
                  >
                    <Ionicons name="chatbubbles" size={18} color="white" />
                    <Text className="text-white font-bold text-sm ml-2">
                      View Inquiries
                    </Text>
                  </TouchableOpacity>
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

export default ManageInquiriesScreen;