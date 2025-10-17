import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { ShoppingBag, Package, Truck, Wallet, Clock, HelpCircle, Settings, LogOut, ChevronRight, Store } from 'lucide-react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import { switchToRole } from '@/utils/general/switch';
import { getInitials } from '@/utils/general/initials';
import { profileOptions } from '@/constants/userHomeScreen';
import ReusableModal from '@/components/general/Modal';
const ProfileScreen: React.FC = () => {

    const { userData, loading } = useCurrentUser();
    const router = useRouter();
    const [switching, setSwitching] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSwitchModal, setShowSwitchModal] = useState(false);

    const handleOptionPress = (optionId: number) => {
        console.log(`Option ${optionId} pressed`);
    };


    const handleLogout = async () => {

        try {
            await signOut(auth);
            router.replace('/(auth)');
        } catch (error: any) {
            console.error('Error during logout:', error);
            Alert.alert(
                'Logout Error',
                error.message || 'Failed to logout. Please try again.'
            );
        }

    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#ec4899" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">

            <View className="bg-white px-6 pt-12 pb-6">
                <View className="flex-row items-center mb-6">
                    <View className="w-20 h-20 rounded-full bg-pink-500 justify-center items-center">
                        <Text className="text-white text-2xl font-bold">
                            {getInitials(userData?.username)}
                        </Text>
                    </View>

                    <View className="ml-4 flex-1">
                        <Text className="text-lg font-semibold text-gray-800">
                            {userData?.username || 'User'}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                            {userData?.email || 'No email'}
                        </Text>
                        {userData?.emailVerified && (
                            <Text className="text-xs text-green-600 mt-1">✓ Verified</Text>
                        )}
                    </View>
                </View>

                {/* Conditional Button - Show "Switch to Seller" if user has sellerInfo, otherwise "Become a Seller" */}
                {userData?.sellerInfo ? (
                    <TouchableOpacity
                        onPress={() => setShowSwitchModal(true)}
                        disabled={switching}
                        className="flex-row items-center justify-center py-4 bg-pink-500 rounded-xl"
                        activeOpacity={0.7}
                    >
                        {switching ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <Store size={18} color="#ffffff" />
                                <Text className="ml-2 text-white font-semibold">Switch to Seller </Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => router.push('/seller/registerAsSeller')}
                        className="flex-row items-center justify-center py-3 border border-pink-400 rounded-xl"
                        activeOpacity={0.7}
                    >
                        <ShoppingBag size={18} color="#ec4899" />
                        <Text className="ml-2 text-pink-500 font-medium">Become a seller?</Text>
                        <ChevronRight size={16} color="#ec4899" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Scrollable Menu Options */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
            >
                {/* My Purchases Section */}
                <Text className="text-gray-900 font-semibold text-base mb-3">
                    My Purchases
                </Text>

                <View className="mb-6">
                    {profileOptions.slice(0, 4).map((option) => {
                        const IconComponent = option.icon;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => handleOptionPress(option.id)}
                                className="bg-white rounded-2xl p-4 flex-row items-center justify-between mb-3 shadow-sm"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-pink-100 w-12 h-12 rounded-full items-center justify-center">
                                        <IconComponent size={20} color="#ec4899" />
                                    </View>
                                    <Text className="text-gray-800 font-medium text-base ml-4">
                                        {option.title}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* General Section */}
                <Text className="text-gray-900 font-semibold text-base mb-3">
                    General
                </Text>

                <View className="mb-4">
                    {profileOptions.slice(4, 7).map((option) => {
                        const IconComponent = option.icon;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => handleOptionPress(option.id)}
                                className="bg-white rounded-2xl p-4 flex-row items-center justify-between mb-3 shadow-sm"
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 3,
                                    elevation: 2,
                                }}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-pink-100 w-12 h-12 rounded-full items-center justify-center">
                                        <IconComponent size={20} color="#ec4899" />
                                    </View>
                                    <Text className="text-gray-800 font-medium text-base ml-4">
                                        {option.title}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={() => setShowLogoutModal(true)}
                    className="bg-white rounded-2xl p-4 flex-row items-center justify-center mt-2 shadow-sm"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 2,
                    }}
                    activeOpacity={0.7}
                >
                    <LogOut size={20} color="#374151" />
                    <Text className="text-gray-800 font-medium text-base ml-2">
                        Logout
                    </Text>
                </TouchableOpacity>
            </ScrollView>


            <ReusableModal
                isVisible={showSwitchModal}
                onCancel={() => setShowSwitchModal(false)}
                title='Switch to Seller Mode?'
                description='Are you sure you want to switch to seller mode?'
                onConfirm={() => switchToRole(userData, router, setSwitching, '/(tabs)/profile', true)}
            />

            <ReusableModal
                isVisible={showLogoutModal}
                onCancel={() => setShowLogoutModal(false)}
                title='Logout?'
                description='Are you sure you want to logout?'
                onConfirm={handleLogout}
                confirmButtonColor='bg-red-500'
            />

        </View>
    );
};

export default ProfileScreen;