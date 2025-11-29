// app/address/index.tsx
import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator, 
    Alert,
    Dimensions,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAddresses } from '@/hooks/general/useAddresses';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing functions
const wp = (percentage: number) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage: number) => (SCREEN_HEIGHT * percentage) / 100;

// Determine if it's a small device
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;

export default function AddressListScreen() {
    const { userData } = useCurrentUser();
    const { addresses, selectedId, loading, handleDeleteAddress, handleSelectAddress } = useAddresses(userData);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white border-b border-gray-100" style={{ paddingHorizontal: wp(4), paddingVertical: hp(1.5) }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="items-center justify-center"
                            style={{ 
                                width: isSmallDevice ? 36 : 40, 
                                height: isSmallDevice ? 36 : 40,
                                marginRight: wp(3)
                            }}
                        >
                            <Ionicons 
                                name="arrow-back" 
                                size={isSmallDevice ? 20 : 24} 
                                color="#1F2937" 
                            />
                        </TouchableOpacity>
                        <Text 
                            className="font-bold text-gray-900"
                            style={{ fontSize: isSmallDevice ? 18 : 20 }}
                            numberOfLines={1}
                        >
                            My Addresses
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/address/form')}
                        className="flex-row items-center bg-pink-500 rounded-lg"
                        style={{ 
                            paddingHorizontal: isSmallDevice ? wp(2.5) : wp(3),
                            paddingVertical: isSmallDevice ? hp(0.8) : hp(1)
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons 
                            name="add" 
                            size={isSmallDevice ? 16 : 18} 
                            color="white" 
                        />
                        <Text 
                            className="text-white font-semibold ml-1"
                            style={{ fontSize: isSmallDevice ? 12 : 14 }}
                        >
                            Add
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#EC4899" />
                </View>
            ) : addresses.length === 0 ? (
                <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: wp(6) }}>
                    <View 
                        className="bg-gray-100 rounded-full items-center justify-center"
                        style={{ 
                            width: isSmallDevice ? wp(24) : wp(28),
                            height: isSmallDevice ? wp(24) : wp(28),
                            marginBottom: hp(2)
                        }}
                    >
                        <Ionicons 
                            name="location-outline" 
                            size={isSmallDevice ? 48 : 64} 
                            color="#9CA3AF" 
                        />
                    </View>
                    <Text 
                        className="font-bold text-gray-900 text-center"
                        style={{ 
                            fontSize: isSmallDevice ? 16 : 18,
                            marginBottom: hp(1)
                        }}
                    >
                        No saved addresses yet
                    </Text>
                    <Text 
                        className="text-gray-500 text-center"
                        style={{ 
                            fontSize: isSmallDevice ? 13 : 14,
                            marginBottom: hp(3)
                        }}
                    >
                        Add a shipping address to complete your orders
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/address/form')}
                        className="bg-pink-500 rounded-xl"
                        style={{
                            paddingHorizontal: wp(6),
                            paddingVertical: hp(1.5)
                        }}
                        activeOpacity={0.8}
                    >
                        <Text 
                            className="text-white font-bold"
                            style={{ fontSize: isSmallDevice ? 14 : 16 }}
                        >
                            Add New Address
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView 
                    className="flex-1" 
                    style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: hp(2) }}
                >
                    {addresses.map((address) => (
                        <TouchableOpacity
                            key={address.id}
                            onPress={() => handleSelectAddress(address.id)}
                            className={`bg-white rounded-xl shadow-sm ${
                                selectedId === address.id ? 'border-2 border-pink-500' : 'border border-gray-100'
                            }`}
                            style={{ 
                                padding: isSmallDevice ? wp(3) : wp(4),
                                marginBottom: hp(1.5)
                            }}
                            activeOpacity={0.7}
                        >
                            {/* Header Section */}
                            <View 
                                className="flex-row justify-between items-start"
                                style={{ marginBottom: hp(1.5) }}
                            >
                                <View className="flex-1" style={{ marginRight: wp(2) }}>
                                    <View className="flex-row items-center flex-wrap mb-1">
                                        <Text 
                                            className="font-bold text-gray-900"
                                            style={{ 
                                                fontSize: isSmallDevice ? 14 : 16,
                                                marginRight: wp(2)
                                            }}
                                            numberOfLines={1}
                                        >
                                            {address.fullName}
                                        </Text>
                                        {address.isDefault && (
                                            <View className="bg-pink-100 rounded" style={{ paddingHorizontal: wp(2), paddingVertical: hp(0.4) }}>
                                                <Text 
                                                    className="font-semibold text-pink-600"
                                                    style={{ fontSize: isSmallDevice ? 10 : 12 }}
                                                >
                                                    Default
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text 
                                        className="text-gray-600"
                                        style={{ fontSize: isSmallDevice ? 12 : 14 }}
                                    >
                                        {address.phoneNumber}
                                    </Text>
                                </View>

                                <View 
                                    className={`rounded-full border-2 items-center justify-center ${
                                        selectedId === address.id ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                                    }`}
                                    style={{ 
                                        width: isSmallDevice ? 20 : 24,
                                        height: isSmallDevice ? 20 : 24,
                                        minWidth: isSmallDevice ? 20 : 24
                                    }}
                                >
                                    {selectedId === address.id && (
                                        <Ionicons 
                                            name="checkmark" 
                                            size={isSmallDevice ? 12 : 16} 
                                            color="white" 
                                        />
                                    )}
                                </View>
                            </View>

                            {/* Address Section */}
                            <View 
                                className="bg-gray-50 rounded-lg"
                                style={{ padding: isSmallDevice ? wp(2.5) : wp(3) }}
                            >
                                <Text 
                                    className="text-gray-700"
                                    style={{ 
                                        fontSize: isSmallDevice ? 12 : 14,
                                        lineHeight: isSmallDevice ? 18 : 20
                                    }}
                                >
                                    {address.streetAddress}
                                    {'\n'}
                                    {address.barangay}, {address.city}
                                    {'\n'}
                                    {address.province}, {address.region}
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View 
                                className="flex-row border-t border-gray-100"
                                style={{ 
                                    marginTop: hp(1.5),
                                    paddingTop: hp(1.5)
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => router.push(`/address/form?id=${address.id}` as any)}
                                    className="flex-row items-center"
                                    style={{ marginRight: wp(4) }}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons 
                                        name="create-outline" 
                                        size={isSmallDevice ? 16 : 18} 
                                        color="#6B7280" 
                                    />
                                    <Text 
                                        className="text-gray-600 font-medium"
                                        style={{ 
                                            fontSize: isSmallDevice ? 12 : 14,
                                            marginLeft: wp(1)
                                        }}
                                    >
                                        Edit
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert(
                                            'Delete Address',
                                            'Are you sure you want to delete this address?',
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                { 
                                                    text: 'Delete', 
                                                    style: 'destructive',
                                                    onPress: () => handleDeleteAddress(address)
                                                }
                                            ]
                                        );
                                    }}
                                    className="flex-row items-center"
                                    activeOpacity={0.7}
                                >
                                    <Ionicons 
                                        name="trash-outline" 
                                        size={isSmallDevice ? 16 : 18} 
                                        color="#EF4444" 
                                    />
                                    <Text 
                                        className="text-red-500 font-medium"
                                        style={{ 
                                            fontSize: isSmallDevice ? 12 : 14,
                                            marginLeft: wp(1)
                                        }}
                                    >
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}