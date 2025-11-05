import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Inquiry } from '@/types/seller/inquiries';
const AllInquriesScreen = () => {
  const { userData } = useCurrentUser();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInquiries = async () => {
    try {
      if (!userData?.uid) return;

      const inquiriesRef = collection(db, 'inquiries');
      const q = query(
        inquiriesRef,
        where('serviceOwnerId', '==', userData.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const fetchedInquiries: Inquiry[] = [];

      querySnapshot.forEach((doc) => {
        fetchedInquiries.push({
          id: doc.id,
          ...doc.data(),
        } as Inquiry);
      });

      setInquiries(fetchedInquiries);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [userData?.uid]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInquiries();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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

  const renderInquiryCard = ({ item }: { item: Inquiry }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
            {item.customerName}
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {item.serviceName}
          </Text>
        </View>
       
      </View>

      <View className="space-y-2 mb-3">
        <View className="flex-row items-center">
          <Ionicons name="mail-outline" size={16} color="#ec4899" />
          <Text className="text-sm text-gray-600 ml-2" numberOfLines={1}>
            {item.customerEmail}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="call-outline" size={16} color="#ec4899" />
          <Text className="text-sm text-gray-600 ml-2">
            {item.customerPhone}
          </Text>
        </View>
      </View>

      <View className="bg-pink-50 rounded-xl p-3 mb-3">
        <Text className="text-sm text-gray-700" numberOfLines={3}>
          {item.message}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Ionicons name="time-outline" size={14} color="#9ca3af" />
        <Text className="text-xs text-gray-400 ml-1">
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center px-8 py-20">
      <View className="bg-pink-100 rounded-full p-6 mb-4">
        <Ionicons name="mail-open-outline" size={48} color="#ec4899" />
      </View>
      <Text className="text-xl font-bold text-gray-800 mb-2">
        No Inquiries Yet
      </Text>
      <Text className="text-sm text-gray-500 text-center">
        You haven't received any inquiries for your services yet.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">
              All Inquiries
            </Text>
          </View>
        </View>

        {/* Loading State */}
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text className="text-gray-500 mt-4">Loading inquiries...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">
              All Inquiries
            </Text>
          </View>
          <View className="bg-pink-500 rounded-full px-3 py-1">
            <Text className="text-white font-bold text-sm">
              {inquiries.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Inquiries List */}
      <FlatList
        data={inquiries}
        renderItem={renderInquiryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1,
        }}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ec4899']}
            tintColor="#ec4899"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AllInquriesScreen;