// app/address/new.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import useToast from '@/hooks/general/useToast';
import GeneralToast from '@/components/general/GeneralToast';
import { AddressForm } from '@/types/user/address';
import { validateFullName } from '@/utils/validation/authValidation';
import { 
  validateContactNumber,
  validateProvince,
  validateCity,
  validateBarangay,
  validateStreetBuildingHouse 
} from '@/utils/validation/user/addressValidation';

interface FormErrors {
  fullName?: string;
  phoneNumber?: string;
  province?: string;
  city?: string;
  barangay?: string;
  streetAddress?: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
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
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5995,
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const { userData } = useCurrentUser();
  const inputRefs = {
    fullName: useRef<TextInput>(null),
    phoneNumber: useRef<TextInput>(null),
    province: useRef<TextInput>(null),
    city: useRef<TextInput>(null),
    barangay: useRef<TextInput>(null),
    streetAddress: useRef<TextInput>(null),
  };

  const updateForm = (field: keyof AddressForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (typeof value === 'string' && errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof FormErrors, value: string): string => {
    switch (field) {
      case 'fullName':
        return validateFullName(value);
      case 'phoneNumber':
        return validateContactNumber(value);
      case 'province':
        return validateProvince(value);
      case 'city':
        return validateCity(value);
      case 'barangay':
        return validateBarangay(value);
      case 'streetAddress':
        return validateStreetBuildingHouse(value);
      default:
        return '';
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    const error = validateField(field, form[field] as string);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setLoadingAddress(true);
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (address) {
        updateForm('region', address.region || '');
        updateForm('province', address.region || '');
        updateForm('city', address.city || '');
        updateForm('barangay', address.district || address.street || '');
        updateForm('streetAddress', address.name || address.street || '');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      showToast('Failed to fetch address details', 'error');
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Please enable location permissions to use this feature', 'error');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      setCoordinates(coords);
      setMapRegion({
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      await reverseGeocode(coords.latitude, coords.longitude);
      setShowMap(true);
      showToast('Location loaded successfully', 'success');
    } catch (error) {
      console.error('Error getting location:', error);
      showToast('Failed to get your current location. Please try again.', 'error');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapDragEnd = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoordinates({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const handleConfirmLocation = () => {
    if (!coordinates) {
      showToast('Please select a location', 'error');
      return;
    }
    setShowMap(false);
    showToast('Location confirmed', 'success');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let firstErrorField: keyof FormErrors | null = null;

    // Validate all fields
    const fullNameError = validateFullName(form.fullName);
    if (fullNameError) {
      newErrors.fullName = fullNameError;
      if (!firstErrorField) firstErrorField = 'fullName';
    }

    const phoneError = validateContactNumber(form.phoneNumber);
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
      if (!firstErrorField) firstErrorField = 'phoneNumber';
    }

    const provinceError = validateProvince(form.province);
    if (provinceError) {
      newErrors.province = provinceError;
      if (!firstErrorField) firstErrorField = 'province';
    }

    const cityError = validateCity(form.city);
    if (cityError) {
      newErrors.city = cityError;
      if (!firstErrorField) firstErrorField = 'city';
    }

    const barangayError = validateBarangay(form.barangay);
    if (barangayError) {
      newErrors.barangay = barangayError;
      if (!firstErrorField) firstErrorField = 'barangay';
    }

    const streetError = validateStreetBuildingHouse(form.streetAddress);
    if (streetError) {
      newErrors.streetAddress = streetError;
      if (!firstErrorField) firstErrorField = 'streetAddress';
    }

    setErrors(newErrors);

    // Focus on first error field
    if (firstErrorField && inputRefs[firstErrorField]?.current) {
      inputRefs[firstErrorField].current?.focus();
      showToast(newErrors[firstErrorField]!, 'error');
    }

    return Object.keys(newErrors).length === 0;
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
      const userSnap = await getDoc(userRef);
      const existingAddresses = userSnap.exists() ? (userSnap.data().addressesList || []) : [];

      let updatedAddresses = existingAddresses;
      if (form.isDefault) {
        updatedAddresses = existingAddresses.map((addr: any) => ({
          ...addr,
          isDefault: false,
          updatedAt: new Date().toISOString()
        }));
      }

      const newAddress = {
        id: Date.now().toString(),
        ...form,
        coordinates: coordinates || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      updatedAddresses.push(newAddress);

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
                ref={inputRefs.fullName}
                value={form.fullName}
                onChangeText={(text) => updateForm('fullName', text)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Enter your full name"
                className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholderTextColor="#9CA3AF"
              />
              {errors.fullName && (
                <Text className="text-red-500 text-xs mt-1">{errors.fullName}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number *</Text>
              <TextInput
                ref={inputRefs.phoneNumber}
                value={form.phoneNumber}
                onChangeText={(text) => updateForm('phoneNumber', text)}
                onBlur={() => handleBlur('phoneNumber')}
                placeholder="09XX XXX XXXX"
                keyboardType="phone-pad"
                maxLength={11}
                className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholderTextColor="#9CA3AF"
              />
              {errors.phoneNumber && (
                <Text className="text-red-500 text-xs mt-1">{errors.phoneNumber}</Text>
              )}
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
                ref={inputRefs.province}
                value={form.province}
                onChangeText={(text) => updateForm('province', text)}
                onBlur={() => handleBlur('province')}
                placeholder="e.g., Metro Manila"
                className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${
                  errors.province ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholderTextColor="#9CA3AF"
              />
              {errors.province && (
                <Text className="text-red-500 text-xs mt-1">{errors.province}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">City/Municipality *</Text>
              <TextInput
                ref={inputRefs.city}
                value={form.city}
                onChangeText={(text) => updateForm('city', text)}
                onBlur={() => handleBlur('city')}
                placeholder="e.g., Quezon City"
                className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${
                  errors.city ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholderTextColor="#9CA3AF"
              />
              {errors.city && (
                <Text className="text-red-500 text-xs mt-1">{errors.city}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Barangay *</Text>
              <TextInput
                ref={inputRefs.barangay}
                value={form.barangay}
                onChangeText={(text) => updateForm('barangay', text)}
                onBlur={() => handleBlur('barangay')}
                placeholder="e.g., Barangay Commonwealth"
                className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${
                  errors.barangay ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholderTextColor="#9CA3AF"
              />
              {errors.barangay && (
                <Text className="text-red-500 text-xs mt-1">{errors.barangay}</Text>
              )}
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Street Name / Building / House No. *
              </Text>
              <TextInput
                ref={inputRefs.streetAddress}
                value={form.streetAddress}
                onChangeText={(text) => updateForm('streetAddress', text)}
                onBlur={() => handleBlur('streetAddress')}
                placeholder="e.g., 123 Main St, Building A, Unit 101"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${
                  errors.streetAddress ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholderTextColor="#9CA3AF"
              />
              {errors.streetAddress && (
                <Text className="text-red-500 text-xs mt-1">{errors.streetAddress}</Text>
              )}
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

      {/* Map Modal */}
      <Modal
        visible={showMap}
        animationType="slide"
        onRequestClose={() => setShowMap(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => setShowMap(false)}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Select Location</Text>
            <TouchableOpacity onPress={handleConfirmLocation}>
              <Text className="text-pink-500 font-semibold">Confirm</Text>
            </TouchableOpacity>
          </View>

          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
          >
            {coordinates && (
              <Marker
                coordinate={coordinates}
                draggable
                onDragEnd={handleMapDragEnd}
                title="Your Location"
              >
                <View className="items-center">
                  <Ionicons name="location-sharp" size={40} color="#EC4899" />
                </View>
              </Marker>
            )}
          </MapView>

          {/* Address Info Card */}
          <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-lg">
            {loadingAddress ? (
              <View className="flex-row items-center justify-center py-4">
                <ActivityIndicator size="small" color="#EC4899" />
                <Text className="text-gray-600 ml-2">Fetching address...</Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-start">
                  <Ionicons name="location" size={20} color="#EC4899" style={{ marginTop: 2 }} />
                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-semibold text-gray-900">
                      {form.streetAddress || 'Address not found'}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {[form.barangay, form.city, form.province]
                        .filter(Boolean)
                        .join(', ') || 'Move the pin to select location'}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-400 mt-3 text-center">
                  Drag the pin to adjust your exact location
                </Text>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <GeneralToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}