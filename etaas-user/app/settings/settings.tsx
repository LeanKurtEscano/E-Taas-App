import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, User, MapPin, Bell, Lock, HelpCircle, X, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import GeneralToast from '@/components/general/GeneralToast';
import useToast from '@/hooks/general/useToast';
import { validateUsername } from '@/utils/validation/authValidation';
import { validateContactNumber } from '@/utils/validation/user/addressValidation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export default function SettingsScreen() {
  const { userData } = useCurrentUser();
  const { toastVisible, toastMessage, toastType, showToast, setToastVisible } = useToast();

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');


  useEffect(() => {
    if (editProfileVisible && userData) {
      setUsername(userData.username || '');
      setPhoneNumber(userData.phoneNumber || '');
    }
  }, [editProfileVisible, userData]);

  const handleUpdateProfile = async () => {

    const userNameError = validateUsername(username);
    if (userNameError) {
      showToast(userNameError, 'error');
      return;
    }


    if (phoneNumber.trim()) {
      const contactNumberError = validateContactNumber(phoneNumber);
      if (contactNumberError) {
        showToast(contactNumberError, 'error');
        return;
      }
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        username: username.trim(),
        phoneNumber: phoneNumber.trim() || null,
        updatedAt: serverTimestamp(),
      });
      
      
      showToast('Profile updated successfully', 'success');
      setEditProfileVisible(false);
    } catch (error) {
      console.error('Profile update error:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      username !== (userData?.username || '') ||
      phoneNumber !== (userData?.phoneNumber || '')
    );
  };

  const settingsOptions = [
    {
      title: 'Account',
      options: [
        {
          icon: User,
          label: 'Edit Profile',
          onPress: () => setEditProfileVisible(true),
        },
        {
          icon: MapPin,
          label: 'Manage Addresses',
          onPress: () => console.log('Navigate to addresses'),
        },
      ],
    },
    {
      title: 'Preferences',
      options: [
        {
          icon: Bell,
          label: 'Notifications',
          onPress: () => router.push('/(tabs)/notification'),
        },
      ],
    },
    
  ];

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="bg-white px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="mr-3"
              >
                <ArrowLeft size={24} color="#111827" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-900">Settings</Text>
            </View>
            <Text className="text-sm text-gray-500">{userData?.email}</Text>
          </View>

          {/* Settings Options */}
          <View className="mt-4">
            {settingsOptions.map((section, sectionIndex) => (
              <View key={sectionIndex} className="mb-4">
                {section.title && (
                  <Text className="text-xs font-semibold text-gray-500 uppercase px-6 mb-2">
                    {section.title}
                  </Text>
                )}
                <View className="bg-white">
                  {section.options.map((option, optionIndex) => {
                    const Icon = option.icon;
                    return (
                      <TouchableOpacity
                        key={optionIndex}
                        onPress={option.onPress}
                        className={`flex-row items-center justify-between px-6 py-4 ${
                          optionIndex !== section.options.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <View className="flex-row items-center flex-1">
                          <Icon size={20} color="#6b7280" />
                          <Text className="ml-3 text-base text-gray-900">
                            {option.label}
                          </Text>
                        </View>
                        <ChevronRight size={20} color="#9ca3af" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity 
                onPress={() => setEditProfileVisible(false)}
                className="mr-3 p-1"
              >
                <ArrowLeft size={24} color="#6b7280" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-6 bg-gray-50">
            {/* Profile Info Card */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <View className="items-center mb-6">
                <View className="w-20 h-20 bg-pink-100 rounded-full items-center justify-center mb-3">
                  <User size={32} color="#ec4899" />
                </View>
                <Text className="text-lg font-semibold text-gray-900">
                  {userData?.username || 'Update your profile'}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">{userData?.email}</Text>
              </View>

              {/* Username */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Username</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                />
                <Text className="text-xs text-gray-500 mt-1.5">
                  Choose a unique username for your account
                </Text>
              </View>

              {/* Phone Number */}
              <View className="mb-2">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Phone Number {!userData?.phoneNumber && <Text className="text-pink-500">(Optional)</Text>}
                </Text>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder={userData?.phoneNumber ? "Enter your phone number" : "Add your phone number"}
                  keyboardType="phone-pad"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
                <Text className="text-xs text-gray-500 mt-1.5">
                  {!userData?.phoneNumber 
                    ? "Add a phone number for account recovery" 
                    : "Update your contact number"}
                </Text>
              </View>
            </View>

            {/* Email Info Card */}
            <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
              <Text className="text-sm font-semibold text-blue-900 mb-2">Email Address</Text>
              <Text className="text-base text-blue-700 mb-2">{userData?.email}</Text>
              <Text className="text-xs text-blue-600">
                🔒 Your email is secure and cannot be changed
              </Text>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View className="px-6 py-4 border-t border-gray-200 bg-white">
            <TouchableOpacity
              onPress={handleUpdateProfile}
              disabled={loading || !hasChanges()}
              className={`bg-pink-500 rounded-xl py-4 items-center shadow-sm ${
                loading || !hasChanges() ? 'opacity-50' : ''
              }`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {hasChanges() ? 'Save Changes' : 'No Changes'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          <GeneralToast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onHide={() => setToastVisible(false)}
          />
        </SafeAreaView>
      </Modal>
      
      <GeneralToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
}