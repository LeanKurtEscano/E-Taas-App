import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy, documentId } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Inquiry } from '@/types/seller/inquiries';
import { ConversationModal } from '@/components/general/ConversationModal';
import { UserData } from '@/hooks/useCurrentUser';

const AllInquriesScreen = () => {
  const { userData } = useCurrentUser();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Use useRef to persist userMap across renders without causing re-renders
  const userMapRef = useRef<Map<string, UserData>>(new Map());

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
      const newCustomerIds: string[] = [];

      querySnapshot.forEach((doc) => {
        const inquiry = {
          id: doc.id,
          ...doc.data(),
        } as Inquiry;
        
        fetchedInquiries.push(inquiry);
        
        // Only add customer IDs that aren't already in our cache
        if (inquiry.customerId && !userMapRef.current.has(inquiry.customerId)) {
          newCustomerIds.push(inquiry.customerId);
        }
      });
6
      if (newCustomerIds.length > 0) {
        // Remove duplicates
        const uniqueCustomerIds = [...new Set(newCustomerIds)];
        
        // Firestore 'in' queries support max 30 items, so batch if needed
        const BATCH_SIZE = 30;
        const batches = [];
        
        for (let i = 0; i < uniqueCustomerIds.length; i += BATCH_SIZE) {
          batches.push(uniqueCustomerIds.slice(i, i + BATCH_SIZE));
        }

        // Fetch all batches in parallel using a single query per batch
        await Promise.all(
          batches.map(async (batch) => {
            const usersRef = collection(db, 'users');
            const usersQuery = query(usersRef, where(documentId(), 'in', batch));
            const usersSnapshot = await getDocs(usersQuery);
            
            usersSnapshot.forEach((doc) => {
              const user = {
                uid: doc.id,
                ...doc.data(),
              } as UserData;
              
              userMapRef.current.set(doc.id, user);
            });
          })
        );
      }

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

  // Handle inquiry click - no API call needed, data is already cached
  const handleInquiryClick = (inquiry: Inquiry) => {
    if (!inquiry.customerId) {
      console.error('No customerId in inquiry');
      return;
    }

    const user = userMapRef.current.get(inquiry.customerId);
    
    if (user) {
      setSelectedUser(user);
      setShowChatModal(true);
    } else {
      console.error('User data not found in cache');
    }
  };

  const renderInquiryCard = ({ item }: { item: Inquiry }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      activeOpacity={0.7}
      onPress={() => handleInquiryClick(item)}
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
        <View className="bg-pink-100 rounded-full px-3 py-1">
          <Ionicons name="chatbubble-outline" size={16} color="#ec4899" />
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

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#9ca3af" />
          <Text className="text-xs text-gray-400 ml-1">
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <Text className="text-xs text-pink-500 font-medium">
          Tap to chat
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
      
      {selectedUser && (
        <ConversationModal
          visible={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setSelectedUser(null);
          }}
          sellerData={selectedUser}
        />
      )}
    </View>
  );
};

export default AllInquriesScreen;