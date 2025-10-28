// app/address/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, arrayRemove,onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAddresses } from '@/hooks/general/useAddresses';
export default function AddressListScreen() {
const { userData } = useCurrentUser();
   const { addresses, selectedId, loading,handleDeleteAddress,handleSelectAddress } = useAddresses(userData);
   

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 py-3 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center mr-3"
                        >
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900">My Addresses</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/address/new')}
                        className="flex-row items-center bg-pink-500 px-3 py-2 rounded-lg"
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={18} color="white" />
                        <Text className="text-white font-semibold text-sm ml-1">Add</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#EC4899" />
                </View>
            ) : addresses.length === 0 ? (
                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-32 h-32 bg-gray-100 rounded-full items-center justify-center mb-4">
                        <Ionicons name="location-outline" size={64} color="#9CA3AF" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 mb-2">No saved addresses yet</Text>
                    <Text className="text-sm text-gray-500 text-center mb-6">
                        Add a shipping address to complete your orders
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/address/new')}
                        className="bg-pink-500 px-6 py-3 rounded-xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-base">Add New Address</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
                    {addresses.map((address) => (
                        <TouchableOpacity
                            key={address.id}
                            onPress={() => handleSelectAddress(address.id)}
                            className={`bg-white rounded-xl p-4 mb-3 shadow-sm ${
                                selectedId === address.id ? 'border-2 border-pink-500' : 'border border-gray-100'
                            }`}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-1">
                                        <Text className="text-base font-bold text-gray-900 mr-2">
                                            {address.fullName}
                                        </Text>
                                        {address.isDefault && (
                                            <View className="bg-pink-100 px-2 py-1 rounded">
                                                <Text className="text-xs font-semibold text-pink-600">Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-sm text-gray-600">{address.phoneNumber}</Text>
                                </View>

                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                    selectedId === address.id ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                                }`}>
                                    {selectedId === address.id && (
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    )}
                                </View>
                            </View>

                            <View className="bg-gray-50 p-3 rounded-lg">
                                <Text className="text-sm text-gray-700 leading-5">
                                    {address.streetAddress}
                                    {'\n'}
                                    {address.barangay}, {address.city}
                                    {'\n'}
                                    {address.province}, {address.region}
                                </Text>
                            </View>

                            <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                                <TouchableOpacity
                                    onPress={() => router.push(`/address/edit?id=${address.id}` as any)}
                                    className="flex-row items-center mr-4"
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="create-outline" size={18} color="#6B7280" />
                                    <Text className="text-sm text-gray-600 ml-1 font-medium">Edit</Text>
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
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    <Text className="text-sm text-red-500 ml-1 font-medium">Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}