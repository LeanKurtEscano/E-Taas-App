import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import { X, Send, ImageIcon, Phone, Mail, Store, ChevronLeft } from 'lucide-react-native';
import { useConversation } from '@/hooks/general/useConversation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { UserData } from '@/hooks/useCurrentUser';
import { formatTime, formatDateMessage } from '@/utils/general/formatDate';

interface ConversationModalProps {
  visible: boolean;
  onClose: () => void;
  sellerData: UserData;
}


const MessageText: React.FC<{ text: string; isCurrentUser: boolean }> = ({ text, isCurrentUser }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };

  return (
    <Text className={`text-base leading-6 ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <Text
              key={index}
              className={`underline ${isCurrentUser ? 'text-white' : 'text-blue-500'}`}
              onPress={() => handleLinkPress(part)}
            >
              {part}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
};

export const ConversationModal: React.FC<ConversationModalProps> = ({
  visible,
  onClose,
  sellerData,
}) => {
  const { userData } = useCurrentUser();
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    messages,
    loading,
    sendingMessage,
    uploadingImage,
    sendMessage,
    uploadImage,
  } = useConversation(userData?.uid || '', sellerData.uid || sellerData.id || '');

  // Determine if the other person is a seller or regular user
  const isOtherPersonASeller = sellerData.sellerInfo && 
    Object.keys(sellerData.sellerInfo).length > 0;

  // Get display name based on who they are
  const otherPersonName = isOtherPersonASeller
    ? sellerData.sellerInfo.shopName
    : (sellerData.addressesList?.[0]?.fullName || 
       sellerData.email?.split('@')[0] || 
       'User');

  const otherPersonRole = isOtherPersonASeller ? 'Shop' : 'Customer';

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedImage) || sendingMessage) return;
    
    const text = messageText;
    const imageUri = selectedImage; // This is now a local URI
    
    setMessageText('');
    setSelectedImage(null);
    
    // sendMessage will handle the Cloudinary upload
    await sendMessage(text, imageUri || '');
  };

  const handleImageUpload = async () => {
    const imageUrl = await uploadImage();
    if (imageUrl) {
      setSelectedImage(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const renderDateSeparator = (currentMessage: any, previousMessage: any) => {
    if (!currentMessage.createdAt) return null;

    const currentDate = currentMessage.createdAt.toDate().toDateString();
    const previousDate = previousMessage?.createdAt?.toDate().toDateString();

    if (currentDate !== previousDate) {
      return (
        <View className="items-center my-4">
          <View className="bg-pink-50 px-4 py-2 rounded-full border border-pink-100">
            <Text className="text-pink-600 text-sm font-medium">
              {formatDateMessage(currentMessage.createdAt)}
            </Text>
          </View>
        </View>
      );
    }
    return null;
  };

  const hasContent = messageText.trim() || selectedImage;

  if (!userData) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white pt-12 pb-4 px-4 border-b border-gray-100 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center mr-3"
              >
                <ChevronLeft size={24} color="#ec4899" />
              </TouchableOpacity>
              
              <View className="bg-pink-500 w-12 h-12 rounded-full items-center justify-center mr-3">
                <Store size={24} color="#fff" />
              </View>
              
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-xl">
                  {otherPersonName}
                </Text>
                <Text className="text-pink-500 text-sm mt-1">
                  {otherPersonRole} • {messages.length > 0 ? 'Active now' : 'Start chatting'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 w-10 h-10 rounded-full items-center justify-center ml-2"
            >
              <X size={24} color="#ec4899" />
            </TouchableOpacity>
          </View>

      
        </View>

        {/* Messages */}
        <View className="flex-1 bg-gray-50">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View className="flex-1 items-center justify-center py-20">
                <ActivityIndicator size="large" color="#ec4899" />
                <Text className="text-gray-600 mt-4 text-lg">Loading messages...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View className="flex-1 items-center justify-center py-20">
                <View className="bg-pink-100 w-24 h-24 rounded-full items-center justify-center mb-4">
                  <Text className="text-4xl">💬</Text>
                </View>
                <Text className="text-gray-900 font-bold text-2xl mb-2">
                  No messages yet
                </Text>
                <Text className="text-gray-600 text-center text-lg">
                  Start the conversation with {otherPersonName}!
                </Text>
              </View>
            ) : (
              <View>
                {messages.map((message, index) => {
                  const isCurrentUser = message.senderId === userData.uid;
                  const previousMessage = index > 0 ? messages[index - 1] : null;
                  
                  return (
                    <View key={message.id}>
                      {renderDateSeparator(message, previousMessage)}
                      <View
                        className={`mb-3 ${
                          isCurrentUser ? 'items-end' : 'items-start'
                        }`}
                      >
                        <View
                          className={`max-w-[85%] rounded-2xl ${
                            isCurrentUser
                              ? 'bg-pink-500 rounded-br-md'
                              : 'bg-white rounded-bl-md shadow-sm border border-gray-100'
                          }`}
                        >
                          {message.imageUrl ? (
                            <View className="p-1.5">
                              <Image
                                source={{ uri: message.imageUrl }}
                                className="w-56 h-56 rounded-xl"
                                resizeMode="cover"
                              />
                            </View>
                          ) : null}
                          {message.text ? (
                            <View className={message.imageUrl ? 'px-3 pb-3 pt-1' : 'px-3 py-2.5'}>
                              <MessageText
                                text={message.text}
                                isCurrentUser={isCurrentUser}
                              />
                            </View>
                          ) : null}
                        </View>
                        <Text className="text-xs text-gray-500 mt-1 px-1">
                          {formatTime(message.createdAt)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View className="bg-white border-t border-gray-200">
            {/* Image Preview */}
            {selectedImage && (
              <View className="px-4 pt-3 pb-2">
                <View className="relative">
                  <Image
                    source={{ uri: selectedImage }}
                    className="w-20 h-20 rounded-xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-gray-900 w-6 h-6 rounded-full items-center justify-center"
                    style={{ elevation: 2 }}
                  >
                    <X size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Input Row */}
            <View className="flex-row items-center gap-3 px-4 py-3">
              <TouchableOpacity
                onPress={handleImageUpload}
                disabled={uploadingImage || sendingMessage}
                className="bg-gray-100 w-12 h-12 rounded-full items-center justify-center"
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#ec4899" />
                ) : (
                  <ImageIcon size={24} color="#6b7280" />
                )}
              </TouchableOpacity>

              <View className="flex-1 bg-gray-100 rounded-3xl px-5 min-h-[48px] max-h-32 justify-center">
                <TextInput
                  value={messageText}
                  onChangeText={setMessageText}
                  placeholder="Type a message..."
                  placeholderTextColor="#9ca3af"
                  className="text-gray-900 text-base leading-5"
                  multiline
                  maxLength={500}
                  editable={!sendingMessage && !uploadingImage}
                  style={{ 
                    paddingTop: Platform.OS === 'ios' ? 12 : 12,
                    paddingBottom: Platform.OS === 'ios' ? 12 : 12,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!hasContent || sendingMessage || uploadingImage}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  hasContent && !sendingMessage && !uploadingImage
                    ? 'bg-pink-500'
                    : 'bg-gray-100'
                }`}
              >
                {sendingMessage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send
                    size={22}
                    color={hasContent && !uploadingImage ? '#fff' : '#9ca3af'}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};