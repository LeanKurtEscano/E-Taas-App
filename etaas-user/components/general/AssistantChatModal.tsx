import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react-native';
import useAssistant from '@/hooks/general/useAssistant';

interface AssistantChatModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  shopId: number;
}

// Sparkling Animation Component
const SparklingLoader = () => {
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createSparkleAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createSparkleAnimation(sparkle1, 0);
    const anim2 = createSparkleAnimation(sparkle2, 200);
    const anim3 = createSparkleAnimation(sparkle3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  const sparkleStyle = (animValue: Animated.Value, position: any) => ({
    position: 'absolute' as const,
    ...position,
    opacity: animValue,
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.2],
        }),
      },
    ],
  });

  return (
    <View className="relative w-12 h-12 items-center justify-center">
      <Animated.View style={sparkleStyle(sparkle1, { top: 2, right: 2 })}>
        <Sparkles size={12} color="#EC4899" fill="#EC4899" />
      </Animated.View>
      <Animated.View style={sparkleStyle(sparkle2, { bottom: 2, left: 2 })}>
        <Sparkles size={16} color="#F472B6" fill="#F472B6" />
      </Animated.View>
      <Animated.View style={sparkleStyle(sparkle3, { top: 8, left: 8 })}>
        <Sparkles size={14} color="#FCA5A5" fill="#FCA5A5" />
      </Animated.View>
    </View>
  );
};

const AssistantChatModal: React.FC<AssistantChatModalProps> = ({
  visible,
  onClose,
  userId,
  shopId,
}) => {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, isLoading, isSending, error, sendMessage } = useAssistant({
    userId,
    shopId,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !error) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, error]);

  const handleSend = async () => {
    if (inputText.trim() && !isSending) {
      await sendMessage(inputText);
      setInputText('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Extract URLs from message text, including those wrapped in backticks
const extractUrls = (text: string): string[] => {
    // Match URLs - more permissive pattern to catch full URLs
    const urlRegex = /`?(https?:\/\/[^\s`<>'")\]]+)`?/gi;
    const matches = text.match(urlRegex) || [];
    // Clean up URLs by removing backticks
    return matches.map(url => {
      let cleaned = url.replace(/`/g, '').trim();
      // Remove trailing punctuation that's clearly not part of URL
      cleaned = cleaned.replace(/[,;:!?]+$/g, '');
      // But keep periods if they're followed by file extensions
      if (!cleaned.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|pdf|html|htm)$/i)) {
        cleaned = cleaned.replace(/\.+$/g, '');
      }
      return cleaned;
    });
  };
  // Check if URL is a Cloudinary image or any image URL
  const isImage = (url: string): boolean => {
    // Accept all Cloudinary URLs or URLs with image extensions
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('cloudinary.com') || 
           /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(lowerUrl);
  };

  // Render message with images
  const renderMessageContent = (msg: any) => {
    const urls = extractUrls(msg.message);
    const imageUrls = urls.filter(isImage);
    // Remove URLs from text, including those with backticks and trailing periods
   let textWithoutUrls = msg.message.replace(/https?:\/\/[^\s<>"']+/gi, '');

    return (
      <>
        {textWithoutUrls && (
          <Text
            className={`text-base ${
              msg.role === 'user' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {textWithoutUrls}
          </Text>
        )}
        {imageUrls.length > 0 && (
          <View className="mt-2 gap-2">
            {imageUrls.length === 1 ? (
              <Image
                key={0}
                source={{ uri: imageUrls[0] }}
                className="w-full h-48 rounded-xl"
                resizeMode="cover"
              />
            ) : imageUrls.length === 2 ? (
              <View className="flex-row gap-2">
                {imageUrls.map((url, index) => (
                  <Image
                    key={index}
                    source={{ uri: url }}
                    className="flex-1 h-40 rounded-xl"
                    resizeMode="cover"
                  />
                ))}
              </View>
            ) : (
              <View className="gap-2">
                <View className="flex-row gap-2">
                  {imageUrls.slice(0, 2).map((url, index) => (
                    <Image
                      key={index}
                      source={{ uri: url }}
                      className="flex-1 h-32 rounded-xl"
                      resizeMode="cover"
                    />
                  ))}
                </View>
                {imageUrls.length > 2 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="gap-2"
                  >
                    {imageUrls.slice(2).map((url, index) => (
                      <Image
                        key={index + 2}
                        source={{ uri: url }}
                        className="w-32 h-32 rounded-xl mr-2"
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        )}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <View className="bg-white rounded-t-3xl h-[90%] shadow-2xl">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-pink-100">
              <View className="flex-row items-center gap-3">
                <View className="bg-pink-500 p-2 rounded-full">
                  <Sparkles size={20} color="white" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-gray-900">
                    AI Assistant
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Always here to help
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4 py-4"
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {isLoading ? (
                <View className="flex-1 items-center justify-center">
                  <SparklingLoader />
                  <Text className="text-gray-500 mt-4 font-medium">Loading chat...</Text>
                </View>
              ) : error ? (
                // Centered Error State
                <View className="flex-1 items-center justify-center px-6">
                  <View className="bg-red-50 p-6 rounded-2xl mb-4">
                    <AlertCircle size={48} color="#DC2626" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                    Oops! Something went wrong
                  </Text>
                  <Text className="text-red-600 text-center text-base font-medium">
                    {error}
                  </Text>
                </View>
              ) : messages.length === 0 ? (
                // Empty State
                <View className="flex-1 items-center justify-center px-6">
                  <View className="bg-pink-50 p-6 rounded-2xl mb-4">
                    <Sparkles size={48} color="#EC4899" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900 mb-2">
                    How can I help you today?
                  </Text>
                  <Text className="text-gray-500 text-center">
                    Ask me anything about products, services, or get
                    personalized recommendations!
                  </Text>
                </View>
              ) : (
                // Chat Messages
                messages.map((msg) => (
                  <View
                    key={msg.id}
                    className={`mb-4 ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <View
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-pink-500'
                          : 'bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {renderMessageContent(msg)}
                      <Text
                        className={`text-xs mt-1 ${
                          msg.role === 'user'
                            ? 'text-pink-100'
                            : 'text-gray-400'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </Text>
                    </View>
                  </View>
                ))
              )}

              {isSending && (
                <View className="items-start mb-4">
                  <View className="bg-gray-100 rounded-2xl px-4 py-3 flex-row items-center gap-3">
                    <SparklingLoader />
                    <Text className="text-gray-700 font-medium">Thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View className="border-t border-pink-100 px-4 py-3 bg-white">
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type your message..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 max-h-24"
                  editable={!isSending}
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!inputText.trim() || isSending}
                  className={`p-3 rounded-full ${
                    inputText.trim() && !isSending
                      ? 'bg-pink-500'
                      : 'bg-gray-200'
                  }`}
                >
                  <Send
                    size={20}
                    color={inputText.trim() && !isSending ? 'white' : '#9CA3AF'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AssistantChatModal;