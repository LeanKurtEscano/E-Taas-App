import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface PromoBannerProps {
  title: string;
  subtitle?: string;
  bgClass: string;
  emoji: string;
  onPress?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ 
  title, 
  subtitle, 
  bgClass, 
  emoji,
  onPress 
}) => (
  <TouchableOpacity 
    className={`${bgClass} bg-pink-400 rounded-3xl p-6 mx-5 mb-4`}
    style={{ minHeight: 140 }}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <View className="flex-row justify-between items-center">
      <View className="flex-1 pr-4">
        <Text className="text-white text-2xl font-bold mb-2 leading-tight">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-white/90 text-sm font-medium">{subtitle}</Text>
        )}
      </View>
      <Text style={{ fontSize: 64 }}>{emoji}</Text>
    </View>
  </TouchableOpacity>
);
