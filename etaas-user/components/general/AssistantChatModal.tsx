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
} from 'react-native';
import { X, Send, Sparkles } from 'lucide-react-native';
import useAssistant from '@/hooks/general/useAssistant';

interface AssistantChatModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  shopId: number;
}

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
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <Text className="text-red-600 text-sm font-medium">
                    {error}
                  </Text>
                </View>
              )}

              {isLoading ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#EC4899" />
                  <Text className="text-gray-500 mt-2">Loading chat...</Text>
                </View>
              ) : messages.length === 0 && !error ? (
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
                      <Text
                        className={`text-base ${
                          msg.role === 'user' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {msg.message}
                      </Text>
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
                  <View className="bg-gray-100 rounded-2xl px-4 py-3 flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#EC4899" />
                    <Text className="text-gray-500">Thinking...</Text>
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