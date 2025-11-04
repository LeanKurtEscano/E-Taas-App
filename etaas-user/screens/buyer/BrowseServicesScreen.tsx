import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useHomeStore } from '@/store/useHomeStore';

interface Service {
  id: string;
  serviceName: string;
  businessName: string;
  ownerName: string;
  contactNumber: string;
  address: string;
  serviceDescription: string;
  category: string;
  priceRange?: string;
  facebookLink?: string;
  availability: boolean;
  bannerImage: string;
  images: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const BrowseServicesScreen = () => {
  const router = useRouter();
  const {serviceCategory, setServiceCategory} = useHomeStore();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Food',
    'Travel & Tours',
    'Therapy',
    'School Supplies',
    'Agricultural',
    'Clothing',
    'Others',
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, serviceCategory, services]);

  const fetchServices = async () => {
    try {
      const servicesRef = collection(db, 'services');
      const q = query(servicesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const servicesData: Service[] = [];
      querySnapshot.forEach((doc) => {
        servicesData.push({
          id: doc.id,
          ...doc.data(),
        } as Service);
      });

      setServices(servicesData);
      setFilteredServices(servicesData);
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchServices();
    } catch (error) {
      console.error('Error refreshing services:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (serviceCategory !== 'All') {
      filtered = filtered.filter(
        (service) => service.category === serviceCategory
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.serviceName.toLowerCase().includes(query) ||
          service.businessName.toLowerCase().includes(query) || 
          service.serviceDescription.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  const handleViewDetails = (serviceId: string) => {
    router.push(`/service/${serviceId}`);
  };

  const handleInquireNow = (service: Service) => {
     router.push(`/service/${service.id}`);
    
  };

  const handleFacebookLink = async (facebookLink?: string) => {
    if (!facebookLink) {
      Alert.alert('No Facebook Link', 'This service has no Facebook page linked.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(facebookLink);
      if (supported) {
        await Linking.openURL(facebookLink);
      } else {
        Alert.alert('Error', 'Unable to open Facebook link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open Facebook link');
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => (
    <TouchableOpacity
      onPress={() => handleViewDetails(service.id)}
      className="mb-4 bg-white rounded-3xl overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
      activeOpacity={0.9}
    >
      {/* Banner Image */}
      <View className="relative">
        <Image
          source={{ uri: service.bannerImage }}
          className="w-full h-48"
          resizeMode="cover"
        />
        
        {/* Availability Badge */}
        <View
          className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${
            service.availability ? 'bg-green-500' : 'bg-gray-500'
          }`}
        >
          <Text className="text-white text-xs font-semibold">
            {service.availability ? 'Available' : 'Unavailable'}
          </Text>
        </View>

        {/* Category Badge */}
        <View className="absolute top-3 left-3 bg-pink-500 px-3 py-1.5 rounded-full">
          <Text className="text-white text-xs font-semibold">
            {service.category}
          </Text>
        </View>
      </View>

      {/* Service Details */}
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-800 mb-1">
          {service.serviceName}
        </Text>
        
        <Text className="text-sm text-gray-600 mb-3">
          {service.businessName}
        </Text>

        <Text className="text-sm text-gray-500 mb-3" numberOfLines={2}>
          {service.serviceDescription}
        </Text>

        {/* Info Row */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <Ionicons name="person-outline" size={16} color="#9ca3af" />
            <Text className="text-sm text-gray-500 ml-1.5" numberOfLines={1}>
              {service.ownerName}
            </Text>
          </View>

          {service.priceRange && (
            <View className="flex-row items-center ml-2">
              <Ionicons name="pricetag-outline" size={16} color="#ec4899" />
              <Text className="text-sm text-pink-500 font-semibold ml-1.5">
                {service.priceRange}
              </Text>
            </View>
          )}
        </View>

        {/* Location */}
        {service.address && (
          <View className="flex-row items-center mb-2">
            <Ionicons name="location-outline" size={16} color="#9ca3af" />
            <Text className="text-sm text-gray-500 ml-1.5 flex-1" numberOfLines={1}>
              {service.address}
            </Text>
          </View>
        )}

        {/* Contact */}
        <View className="flex-row items-center mb-4">
          <Ionicons name="call-outline" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500 ml-1.5">
            {service.contactNumber}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          {service.facebookLink && (
            <TouchableOpacity
              onPress={() => handleFacebookLink(service.facebookLink)}
              className="flex-1 bg-blue-500 rounded-xl py-3 flex-row items-center justify-center"
              style={{
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="logo-facebook" size={18} color="white" />
              <Text className="text-white font-semibold text-sm ml-2">
                Facebook
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={() => handleInquireNow(service)}
            className={`${service.facebookLink ? 'flex-1' : 'flex-1'} bg-pink-500 rounded-xl py-3 flex-row items-center justify-center`}
            style={{
              shadowColor: '#ec4899',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">
              Inquire Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-800">
            Browse Services
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 mb-3">
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setServiceCategory(category)}
              className={`mr-2 px-4 py-2 rounded-full border ${
                serviceCategory === category
                  ? 'bg-pink-500 border-pink-500'
                  : 'bg-white border-gray-300'
              }`}
              style={{
                shadowColor: serviceCategory === category ? '#ec4899' : '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: serviceCategory === category ? 0.2 : 0.05,
                shadowRadius: 2,
                elevation: serviceCategory === category ? 2 : 1,
              }}
            >
              <Text
                className={`text-sm font-medium ${
                  serviceCategory === category
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        {filteredServices.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Ionicons name="search-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-400 text-lg font-semibold mt-4">
              No services found
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-8">
              {searchQuery || serviceCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Be the first to offer a service!'}
            </Text>
          </View>
        ) : (
          filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default BrowseServicesScreen;