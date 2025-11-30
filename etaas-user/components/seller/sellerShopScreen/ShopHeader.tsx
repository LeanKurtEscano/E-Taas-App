// components/seller/sellerShopScreen/ShopHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Edit, Star, Users, MapPin } from 'lucide-react-native';
import { ShopData } from '@/types/seller/shop';

interface ShopHeaderProps {
  shopData: ShopData;
  isOwner: boolean;
  onEdit: () => void;
  onCoverPhotoPress: () => void;
  onProfilePhotoPress: () => void;
  coverPhotoUrl?: string;
  profilePhotoUrl?: string;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  shopData,
  isOwner,
  onEdit,
  onCoverPhotoPress,
  onProfilePhotoPress,
  coverPhotoUrl,
  profilePhotoUrl,
}) => {
  return (
    <View className="bg-white mb-2">
      {/* Cover Photo / Banner */}
      <TouchableOpacity
        onPress={isOwner ? onCoverPhotoPress : undefined}
        disabled={!isOwner}
        activeOpacity={isOwner ? 0.7 : 1}
        className="relative"
      >
        {coverPhotoUrl ? (
          <Image
            source={{ uri: coverPhotoUrl }}
            className="w-full h-48"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 items-center justify-center">
            <Text className="text-gray-400 text-sm">
              {isOwner ? 'Tap to add cover photo' : 'No cover photo'}
            </Text>
          </View>
        )}
        
        {isOwner && (
          <View className="absolute bottom-3 right-3 bg-black/50 rounded-full p-2">
            <Edit size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {/* Shop Info Container */}
      <View className="px-4 pb-4">
        {/* Profile Picture & Edit Button Row */}
        <View className="flex-row items-end justify-between -mt-12 mb-3">
          {/* Profile Picture */}
          <TouchableOpacity
            onPress={isOwner ? onProfilePhotoPress : undefined}
            disabled={!isOwner}
            activeOpacity={isOwner ? 0.7 : 1}
            className="relative"
          >
            {profilePhotoUrl ? (
              <Image
                source={{ uri: profilePhotoUrl }}
                className="w-24 h-24 rounded-full border-4 border-white"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 items-center justify-center">
                <Text className="text-2xl font-bold text-gray-400">
                  {shopData.shopName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            
            {isOwner && (
              <View className="absolute bottom-0 right-0 bg-pink-600 rounded-full p-1.5">
                <Edit size={14} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {/* Edit Shop Button */}
          {isOwner && (
            <TouchableOpacity
              onPress={onEdit}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex-row items-center"
            >
              <Edit size={16} color="#374151" />
              <Text className="ml-2 font-semibold text-gray-700">Edit Shop</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Shop Name & Business Name */}
        <View className="mb-2">
          <Text className="text-2xl font-bold text-gray-900">
            {shopData.shopName}
          </Text>
          <Text className="text-sm text-gray-600">{shopData.businessName}</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center mb-3 gap-4">
          <View className="flex-row items-center">
            <Star size={16} color="#EAB308" fill="#EAB308" />
            <Text className="ml-1 text-sm font-semibold text-gray-900">
              {shopData.rating}
            </Text>
            <Text className="ml-1 text-sm text-gray-600">
              ({shopData.reviewCount})
            </Text>
          </View>
          <View className="flex-row items-center">
            <Users size={16} color="#6B7280" />
            <Text className="ml-1 text-sm text-gray-600">
              {shopData.followers} followers
            </Text>
          </View>
        </View>

        {/* Location */}
        <View className="flex-row items-start mb-2">
          <MapPin size={16} color="#6B7280" className="mt-0.5" />
          <Text className="ml-2 text-sm text-gray-600 flex-1">
            {shopData.addressLocation}
          </Text>
        </View>

        {/* Description */}
        {shopData.description && (
          <Text className="text-sm text-gray-700 leading-5">
            {shopData.description}
          </Text>
        )}

        {/* Contact Info */}
        <View className="mt-3 pt-3 border-t border-gray-200">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500">Contact</Text>
              <Text className="text-sm text-gray-900">
                {shopData.contactNumber}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">Email</Text>
              <Text className="text-sm text-gray-900">{shopData.email}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};