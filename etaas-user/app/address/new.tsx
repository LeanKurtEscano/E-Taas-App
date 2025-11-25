// app/address/new.tsx
import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import * as Location from 'expo-location';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import useToast from '@/hooks/general/useToast';
import GeneralToast from '@/components/general/GeneralToast';
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



export default function AddNewAddressScreen() {

    const { toastVisible, toastMessage, toastType, showToast, setToastVisible } = useToast();
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
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const { userData } = useCurrentUser();

  const updateForm = (field: keyof AddressForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Please enable location permissions to use this feature', 'error');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      // Reverse geocode
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (address) {
        // Update form with location data
        updateForm('region', address.region || '');
        updateForm('province', address.region || '');
        updateForm('city', address.city || '');
        updateForm('barangay', address.district || address.street || '');
        updateForm('streetAddress', address.name || address.street || '');

        showToast('Location data loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      showToast('Failed to get your current location. Please enter manually.', 'error');
    } finally {
      setLoadingLocation(false);
    }
  };

  const validateForm = (): boolean => {
    if (!form.fullName.trim()) {
      showToast( 'Please enter your full name', 'error');
      return false;
    }
    if (!form.phoneNumber.trim() || form.phoneNumber.length < 11) {
      showToast('Please enter a valid phone number', 'error');
      return false;
    }
    
    if (!form.province.trim()) {
      showToast('Please enter your province', 'error');
      return false;
    }
    if (!form.city.trim()) {
      showToast('Please enter your city/municipality', 'error');
      return false;
    }
    if (!form.barangay.trim()) {
      showToast('Please enter your barangay', 'error');
      return false;
    }
    if (!form.streetAddress.trim()) {
      showToast('Please enter your street address', 'error');
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
  
      if (!userData) {
        showToast('You must be logged in to save an address', 'error');
        return;
      }

      const userRef = doc(db, 'users', userData.uid);
      
      // Get current addresses
      const userSnap = await getDoc(userRef);
      const existingAddresses = userSnap.exists() ? (userSnap.data().addressesList || []) : [];

      // If this address is being set as default, unset all other defaults
      let updatedAddresses = existingAddresses;
      if (form.isDefault) {
        updatedAddresses = existingAddresses.map((addr: any) => ({
          ...addr,
          isDefault: false,
          updatedAt: new Date().toISOString()
        }));
      }

      // Create new address object with unique ID
      const newAddress = {
        id: Date.now().toString(),
        ...form,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add the new address to the list
      updatedAddresses.push(newAddress);

      // Update the user document with all addresses
      await updateDoc(userRef, {
        addressesList: updatedAddresses
      });

      showToast('Address saved successfully', 'success');
      router.back();
    } catch (error) {
      console.error('Error saving address:', error);
      showToast('Failed to save address. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          <Text className="text-xl font-bold text-gray-900">Add New Address</Text>
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

          {/* Location Button */}
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            disabled={loadingLocation}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-200 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color="#EC4899" />
            ) : (
              <>
                <Ionicons name="location" size={20} color="#EC4899" />
                <Text className="text-pink-500 font-semibold text-base ml-2">
                  Use My Current Location
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Address Details */}
          <View className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
            <Text className="text-base font-bold text-gray-900 mb-3">Address Details</Text>
            
           

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
            className="bg-white rounded-xl p-4 mb-4 shadow-sm flex-row items-center justify-between"
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

        {/* Save Button */}
        <View className="bg-white border-t border-gray-100 px-4 py-3">
          <TouchableOpacity
            onPress={handleSaveAddress}
            disabled={loading}
            className="bg-pink-500 py-3.5 rounded-xl shadow-sm"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-center text-base">
                Save Address
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
        <GeneralToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}