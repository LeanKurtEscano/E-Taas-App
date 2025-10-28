// app/address/edit.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface AddressForm {
  fullName: string;
  phoneNumber: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  streetAddress: string;
  isDefault: boolean;
}

interface Address extends AddressForm {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userData } = useCurrentUser();
  
  const [form, setForm] = useState<AddressForm>({
    fullName: '',
    phoneNumber: '',
    region: '',
    province: '',
    city: '',
    barangay: '',
    streetAddress: '',
    isDefault: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalAddress, setOriginalAddress] = useState<Address | null>(null);

  useEffect(() => {
    fetchAddressData();
  }, []);

  const fetchAddressData = async () => {
    try {
      if (!userData || !id) return;

      const userRef = doc(db, 'users', userData.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const addressList = data.addressesList || [];
        const address = addressList.find((addr: Address) => addr.id === id);

        if (address) {
          setOriginalAddress(address);
          setForm({
            fullName: address.fullName || '',
            phoneNumber: address.phoneNumber || '',
            region: address.region || '',
            province: address.province || '',
            city: address.city || '',
            barangay: address.barangay || '',
            streetAddress: address.streetAddress || '',
            isDefault: address.isDefault || false
          });
        } else {
          Alert.alert('Error', 'Address not found', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      Alert.alert('Error', 'Failed to load address data');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof AddressForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!form.phoneNumber.trim() || form.phoneNumber.length < 11) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }
    if (!form.region.trim()) {
      Alert.alert('Error', 'Please enter your region');
      return false;
    }
    if (!form.province.trim()) {
      Alert.alert('Error', 'Please enter your province');
      return false;
    }
    if (!form.city.trim()) {
      Alert.alert('Error', 'Please enter your city/municipality');
      return false;
    }
    if (!form.barangay.trim()) {
      Alert.alert('Error', 'Please enter your barangay');
      return false;
    }
    if (!form.streetAddress.trim()) {
      Alert.alert('Error', 'Please enter your street address');
      return false;
    }
    return true;
  };

  const handleUpdateAddress = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (!userData || !id || !originalAddress) return;

      const userRef = doc(db, 'users', userData.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const addressList = data.addressesList || [];

        // Update the specific address in the array
        const updatedAddresses = addressList.map((addr: Address) => {
          if (addr.id === id) {
            return {
              ...addr,
              ...form,
              updatedAt: new Date().toISOString()
            };
          }
          // If this address is being set as default, unset others
          if (form.isDefault && addr.isDefault && addr.id !== id) {
            return {
              ...addr,
              isDefault: false
            };
          }
          return addr;
        });

        await updateDoc(userRef, {
          addressesList: updatedAddresses
        });

        Alert.alert('Success', 'Address updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error updating address:', error);
      Alert.alert('Error', 'Failed to update address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Edit Address</Text>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Edit Address</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {/* Contact Information */}
          <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
            <Text className="text-base font-bold text-gray-900 mb-3">Contact Information</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Full Name *</Text>
              <TextInput
                value={form.fullName}
                onChangeText={(text) => updateForm('fullName', text)}
                placeholder="Enter your full name"
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number *</Text>
              <TextInput
                value={form.phoneNumber}
                onChangeText={(text) => updateForm('phoneNumber', text)}
                placeholder="09XX XXX XXXX"
                keyboardType="phone-pad"
                maxLength={11}
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Address Details */}
          <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
            <Text className="text-base font-bold text-gray-900 mb-3">Address Details</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Region *</Text>
              <TextInput
                value={form.region}
                onChangeText={(text) => updateForm('region', text)}
                placeholder="e.g., National Capital Region"
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Province *</Text>
              <TextInput
                value={form.province}
                onChangeText={(text) => updateForm('province', text)}
                placeholder="e.g., Metro Manila"
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">City/Municipality *</Text>
              <TextInput
                value={form.city}
                onChangeText={(text) => updateForm('city', text)}
                placeholder="e.g., Quezon City"
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Barangay *</Text>
              <TextInput
                value={form.barangay}
                onChangeText={(text) => updateForm('barangay', text)}
                placeholder="e.g., Barangay Commonwealth"
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Street Name / Building / House No. *
              </Text>
              <TextInput
                value={form.streetAddress}
                onChangeText={(text) => updateForm('streetAddress', text)}
                placeholder="e.g., 123 Main St, Building A, Unit 101"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Set as Default */}
          <TouchableOpacity
            onPress={() => updateForm('isDefault', !form.isDefault)}
            className="bg-white rounded-xl p-4 mb-4 border border-gray-200 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-pink-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="star" size={20} color="#EC4899" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">Set as default address</Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  This will be used for all your orders
                </Text>
              </View>
            </View>
            <View className={`w-12 h-7 rounded-full items-center ${
              form.isDefault ? 'bg-pink-500 justify-end' : 'bg-gray-300 justify-start'
            } flex-row px-1`}>
              <View className="w-5 h-5 bg-white rounded-full shadow-sm" />
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Update Button */}
        <View className="bg-white border-t border-gray-100 px-4 py-3">
          <TouchableOpacity
            onPress={handleUpdateAddress}
            disabled={saving}
            className="bg-pink-500 py-3.5 rounded-xl shadow-sm"
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-center text-base">
                Update Address
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}