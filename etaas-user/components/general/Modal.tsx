import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';

interface ReusableModalProps {
  isVisible: boolean;
  onCancel: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  confirmButtonColor?: string;
  isLoading?: boolean;
}

const ReusableModal: React.FC<ReusableModalProps> = ({
  isVisible,
  onCancel,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  confirmButtonColor = 'bg-pink-500',
  isLoading = false,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={isLoading ? undefined : onCancel}
      >
        <Pressable 
          className="bg-white rounded-2xl w-full max-w-sm p-6"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <Text className="text-xl font-bold text-gray-900 mb-3">
            {title}
          </Text>

          {/* Description */}
          <Text className="text-base text-gray-600 mb-6 leading-6">
            {description}
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center"
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text className={`font-semibold text-base ${isLoading ? 'text-gray-400' : 'text-gray-700'}`}>
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 ${confirmButtonColor} py-3.5 rounded-xl items-center ${isLoading ? 'opacity-70' : ''}`}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ReusableModal;