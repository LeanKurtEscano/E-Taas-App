// components/ShopHeader.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Camera, Edit, Star, Users, MessageCircle } from 'lucide-react-native';
import { ShopData } from '@/types/seller/shop';

interface ShopHeaderProps {
  shopData: ShopData;
  isOwner: boolean;
  onEdit: () => void;
  onCoverPhotoPress?: () => void;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  shopData,
  isOwner,
  onEdit,
  onCoverPhotoPress,
}) => {
  return (
    <View className="bg-white">
      {/* Cover Photo */}
      <View className="h-40 bg-gradient-to-r from-pink-400 to-pink-600 relative">
        {shopData.coverPhoto ? (
          <Image 
            source={{ uri: shopData.coverPhoto }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-pink-500" />
        )}
        {isOwner && (
          <TouchableOpacity 
            className="absolute bottom-2 right-2 bg-white rounded-full p-2"
            onPress={onCoverPhotoPress}
          >
            <Camera size={20} color="#E91E8C" />
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Section */}
      <View className="px-4 pb-4">
        <View className="flex-row items-end -mt-12 mb-3">
          <View className="bg-white rounded-full p-1">
            {shopData.profilePhoto ? (
              <Image 
                source={{ uri: shopData.profilePhoto }}
                className="w-24 h-24 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-pink-500 items-center justify-center">
                <Text className="text-white text-3xl font-bold">
                  {shopData.shopName.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Shop Info */}
        <View className="mb-3">
          <Text className="text-2xl font-bold text-gray-900">
            {shopData.shopName}
          </Text>
          <Text className="text-gray-600 mt-1">{shopData.businessName}</Text>
          {shopData.description && (
            <Text className="text-gray-600 mt-2">{shopData.description}</Text>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row items-center mb-4">
          <View className="flex-row items-center mr-4">
            <Star size={16} color="#FFA500" fill="#FFA500" />
            <Text className="ml-1 text-gray-700 font-semibold">
              {shopData.rating?.toFixed(1) || '0.0'}
            </Text>
            <Text className="ml-1 text-gray-500">
              ({shopData.reviewCount || 0})
            </Text>
          </View>
          <View className="flex-row items-center">
            <Users size={16} color="#E91E8C" />
            <Text className="ml-1 text-gray-700 font-semibold">
              {shopData.followers || 0}
            </Text>
            <Text className="ml-1 text-gray-500">Followers</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {isOwner ? (
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-pink-500 py-3 rounded-lg flex-row items-center justify-center mr-2"
              onPress={onEdit}
            >
              <Edit size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Edit Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-pink-100 py-3 px-4 rounded-lg">
              <MessageCircle size={20} color="#E91E8C" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row space-x-2">
            <TouchableOpacity className="flex-1 bg-pink-500 py-3 rounded-lg mr-2">
              <Text className="text-white font-semibold text-center">Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-pink-100 py-3 rounded-lg flex-row items-center justify-center">
              <MessageCircle size={20} color="#E91E8C" />
              <Text className="text-pink-500 font-semibold ml-2">Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};