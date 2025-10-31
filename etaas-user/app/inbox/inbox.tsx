import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Store, User, Clock, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useInbox } from '@/hooks/general/useInbox';
import { ConversationModal } from '@/components/general/ConversationModal';
import { UserData, useCurrentUser } from '@/hooks/useCurrentUser';

const InboxScreen = () => {
  const router = useRouter();
  const { userData } = useCurrentUser(); // Add this
  const { conversations, loading, error } = useInbox();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  console.log('Conversations:', conversations);
  
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleConversationPress = (otherUser: UserData | undefined) => {
    if (!otherUser) return;
    setSelectedUser(otherUser);
    setShowChatModal(true);
    console.log('Selected User:', otherUser);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // The real-time listener will automatically update
    setTimeout(() => setRefreshing(false), 1000);
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // Add this helper function
  const formatLastMessage = (conversation: any) => {
    const isCurrentUser = conversation.lastMessageSender === userData?.uid;
    const prefix = isCurrentUser ? 'You: ' : '';
    return prefix + conversation.lastMessage;
  };

  if (loading && conversations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text className="text-gray-600 mt-4">Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 -ml-2"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 items-center justify-center">
                <ArrowLeft size={24} color="#1f2937" />
              </View>
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900">Inbox</Text>
              <Text className="text-gray-600 text-sm mt-1">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <View className="bg-pink-100 w-12 h-12 rounded-full items-center justify-center">
            <MessageCircle size={24} color="#ec4899" />
          </View>
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ec4899"
            colors={['#ec4899']}
          />
        }
      >
        {error ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Text className="text-6xl mb-4">😔</Text>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              Something went wrong
            </Text>
            <Text className="text-gray-600 text-center">{error}</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Text className="text-6xl mb-4">💬</Text>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              No conversations yet
            </Text>
            <Text className="text-gray-600 text-center">
              Start chatting with sellers to see your conversations here
            </Text>
          </View>
        ) : (
          <View className="px-4 py-4">
            {conversations.map((conversation) => {
              const otherUser = conversation.otherParticipant;
              const hasUnread = (conversation.unreadCount || 0) > 0;

              if (!otherUser) return null;

              return (
                <TouchableOpacity
                  key={conversation.id}
                  onPress={() => handleConversationPress(otherUser)}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start">
                    {/* Avatar */}
                    <View className="mr-3">
                      { otherUser.sellerInfo ? (
                        <View className="bg-pink-500 w-14 h-14 rounded-full items-center justify-center">
                          <Store size={24} color="#fff" />
                        </View>
                      ) : (
                        <View className="bg-pink-500 w-14 h-14 rounded-full items-center justify-center">
                          <User size={24} color="#fff" />
                        </View>
                      )}
                      {hasUnread && (
                        <View className="absolute -top-1 -right-1 bg-pink-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                          <Text className="text-white text-xs font-bold">
                            {conversation.unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Content */}
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text
                          className={`text-base flex-1 ${
                            hasUnread
                              ? 'text-gray-900 font-bold'
                              : 'text-gray-900 font-semibold'
                          }`}
                          numberOfLines={1}
                        >
                          { otherUser.sellerInfo
                            ? otherUser.sellerInfo.shopName
                            : otherUser.username || 'User'}
                        </Text>
                        <View className="flex-row items-center ml-2">
                          <Clock size={12} color="#9ca3af" />
                          <Text className="text-gray-500 text-xs ml-1">
                            {formatTimestamp(conversation.lastMessageAt)}
                          </Text>
                        </View>
                      </View>

                      {  otherUser.sellerInfo && (
                        <Text className="text-gray-500 text-xs mb-1">
                          {otherUser.sellerInfo.businessName}
                        </Text>
                      )}

                      <Text
                        className={`text-sm ${
                          hasUnread ? 'text-gray-700 font-medium' : 'text-gray-600'
                        }`}
                        numberOfLines={2}
                      >
                        {truncateMessage(formatLastMessage(conversation))}
                      </Text>

                      {/* Labels */}
                      <View className="flex-row items-center mt-2 gap-2">
                        {otherUser.isSeller && (
                          <View className="bg-pink-100 px-2 py-1 rounded-md">
                            <Text className="text-pink-600 text-xs font-semibold">
                              Seller
                            </Text>
                          </View>
                        )}
                        {hasUnread && (
                          <View className="bg-pink-500 px-2 py-1 rounded-md">
                            <Text className="text-white text-xs font-semibold">
                              New
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Conversation Modal */}
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
    </SafeAreaView>
  );
};

export default InboxScreen;