import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Store, Package, TrendingUp, DollarSign, Users, BarChart3, Settings, HelpCircle, LogOut, ChevronRight, RefreshCw } from 'lucide-react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { switchToRole } from '@/utils/general/switch';
import { sellerOptions } from '@/constants/sellerHomeScreen';
import { getInitials } from '@/utils/general/initials';
import ReusableModal from '@/components/general/Modal';
const SellerProfileScreen: React.FC = () => {
    const { userData, loading } = useCurrentUser();
    const router = useRouter();
    const [switching, setSwitching] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSwitchModal, setShowSwitchModal] = useState(false);

    const handleOptionPress = (optionId: number) => {
        console.log(`Seller Option ${optionId} pressed`);

    };

    const handleSwitchToUser = async () => {
        Alert.alert(
            'Switch to User Mode',
            'Do you want to switch to user mode? You can switch back anytime.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Switch',
                    onPress: async () => {
                        try {
                            setSwitching(true);
                            if (userData?.uid) {
                                const userRef = doc(db, 'users', userData.uid);
                                await updateDoc(userRef, {
                                    isSeller: false,
                                    updatedAt: new Date(),
                                });
                                router.replace('/(tabs)/profile');
                            }
                        } catch (error: any) {
                            console.error('Error switching to user mode:', error);
                            Alert.alert(
                                'Error',
                                'Failed to switch to user mode. Please try again.'
                            );
                        } finally {
                            setSwitching(false);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleGoToShop = () => {

        router.push(`/seller/store`);
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
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#ec4899" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
            >




                <View
                    className="bg-white rounded-3xl p-6 "

                >

                    <View className="flex-row items-center mb-6">
                        <View className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 justify-center items-center" style={{ backgroundColor: '#ec4899' }}>
                            <Text className="text-white text-2xl font-bold">
                                {getInitials(userData?.sellerInfo?.name || userData?.username)}
                            </Text>
                        </View>

                        <View className="flex-1 ml-4">
                            <Text className="text-xl font-bold text-gray-900">
                                {userData?.sellerInfo?.shopName || 'My Shop'}
                            </Text>
                            <Text className="text-sm text-gray-600 mt-1">
                                {userData?.sellerInfo?.businessName || 'Business'}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">
                                📍 {userData?.sellerInfo?.addressLocation || 'No location'}
                            </Text>
                            {userData?.emailVerified && (
                                <View className="bg-green-100 px-3 py-1 rounded-full mt-2 self-start">
                                    <Text className="text-xs text-green-700 font-medium">✓ Verified Seller</Text>
                                </View>
                            )}
                        </View>
                    </View>


                    <View className="space-y-3">
                        <TouchableOpacity
                            onPress={handleGoToShop}
                            className="flex-row items-center justify-center mb-3 pr-52  py-4 bg-pink-500 rounded-xl"
                            activeOpacity={0.7}
                        >
                            <Store size={20} color="#ffffff" />
                            <Text className="ml-2 text-white  font-semibold text-base">
                                View My Shop
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowSwitchModal(true)}
                            disabled={switching}
                            className="flex-row items-center justify-center py-4 bg-gray-100 rounded-xl"
                            activeOpacity={0.7}
                        >
                            {switching ? (
                                <ActivityIndicator size="small" color="#6b7280" />
                            ) : (
                                <View className="flex-row items-center">
                                    <RefreshCw size={20} color="#6b7280" />
                                    <Text className="ml-2 text-gray-700 font-semibold text-base">
                                        Switch to User
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>



                <View className="px-6 mt-6">

                    <Text className="text-gray-900 font-bold text-lg mb-4">
                        Business Management
                    </Text>

                    <View className="mb-6">
                        {sellerOptions.slice(0, 3).map((option) => {
                            const IconComponent = option.icon;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => handleOptionPress(option.id)}
                                    className="bg-white rounded-2xl p-4 flex-row items-center justify-between mb-3"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className=" w-12 h-12 rounded-xl items-center justify-center">
                                            <IconComponent size={22} color="#ec4899" />
                                        </View>
                                        <Text className="text-gray-800 font-semibold text-base ml-4">
                                            {option.title}
                                        </Text>
                                    </View>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Analytics & Insights Section */}
                    <Text className="text-gray-900 font-bold text-lg mb-4">
                        Analytics & Insights
                    </Text>

                    <View className="mb-6">
                        {sellerOptions.slice(3, 6).map((option) => {
                            const IconComponent = option.icon;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => handleOptionPress(option.id)}
                                    className="bg-white rounded-2xl p-4 flex-row items-center justify-between mb-3"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className=" w-12 h-12 rounded-xl items-center justify-center">
                                            <IconComponent size={22} color="#a855f7" />
                                        </View>
                                        <Text className="text-gray-800 font-semibold text-base ml-4">
                                            {option.title}
                                        </Text>
                                    </View>
                                    <ChevronRight size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            );
                        })}
                    </View>


                    <Text className="text-gray-900 font-bold text-lg mb-4">
                        Settings & Support
                    </Text>

                    <View className="mb-6">
                        {sellerOptions.slice(6, 8).map((option) => {
                            const IconComponent = option.icon;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => handleOptionPress(option.id)}
                                    className="bg-white rounded-2xl p-4 flex-row items-center justify-between mb-3"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-12 h-12 rounded-xl items-center justify-center">
                                            <IconComponent size={22} color="#6b7280" />
                                        </View>
                                        <Text className="text-gray-800 font-semibold text-base ml-4">
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
                        className="bg-white rounded-2xl p-4 flex-row items-center justify-center mb-2"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                        activeOpacity={0.7}
                    >
                        <LogOut size={20} color="#ef4444" />
                        <Text className="text-red-500 font-semibold text-base ml-2">
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ReusableModal
                isVisible={showSwitchModal}
                onCancel={() => setShowSwitchModal(false)}
                title='Switch to User Mode?'
                description='Are you sure you want to switch to user mode?'
                onConfirm={() => switchToRole(userData, router, setSwitching, '/(tabs)/profile', false)}
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

export default SellerProfileScreen;