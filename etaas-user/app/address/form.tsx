// app/address/form.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { WebView } from 'react-native-webview';
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocation } from '@/hooks/general/useLocation';
import { FormErrors, UserAddress } from '@/types/user/address';

export default function AddressFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

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
  const [tempForm, setTempForm] = useState<AddressForm | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [originalAddress, setOriginalAddress] = useState<UserAddress | null>(null);
  const webViewRef = useRef<WebView>(null);

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
    if (typeof value === 'string' && errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const {
    coordinates,
    setCoordinates,
    tempCoordinates,
    setTempCoordinates,
    loadingLocation,
    loadingAddress,
    locationError,
    setLocationError,
    mapRegion,
    setMapRegion,
    handleUseCurrentLocation,
    handleMapDragEnd: originalHandleMapDragEnd,
  } = useLocation({
    form,
    updateForm,
    setTempForm,
    showToast,
  });

  // Generate HTML for OpenStreetMap with Leaflet
  const generateMapHTML = () => {
    const lat = tempCoordinates?.latitude || mapRegion.latitude;
    const lng = tempCoordinates?.longitude || mapRegion.longitude;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .leaflet-control-attribution { font-size: 8px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          var map = L.map('map', {
            zoomControl: true,
            attributionControl: true
          }).setView([${lat}, ${lng}], 16);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          var marker = L.marker([${lat}, ${lng}], {
            draggable: true,
            icon: L.divIcon({
              html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EC4899" width="40" height="40"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
              className: 'custom-marker',
              iconSize: [40, 40],
              iconAnchor: [20, 40]
            })
          }).addTo(map);

          marker.on('dragend', function(e) {
            var position = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerMoved',
              latitude: position.lat,
              longitude: position.lng
            }));
          });

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerMoved',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }));
          });

          // Initial position message
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapReady',
            latitude: ${lat},
            longitude: ${lng}
          }));
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'markerMoved') {
        const coords = {
          latitude: data.latitude,
          longitude: data.longitude
        };
        setTempCoordinates(coords);

        // Call reverse geocode using the hook's function
        await originalHandleMapDragEnd({
          nativeEvent: {
            coordinate: coords
          }
        });
      } else if (data.type === 'mapReady') {
        console.log('Map is ready');
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  useEffect(() => {
    if (isEditMode && userData?.uid && id) {
      fetchAddressData();
    }
  }, [userData?.uid, id]);

  const fetchAddressData = async () => {
    try {
      if (!userData || !id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const userRef = doc(db, 'users', userData.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const addressList = data.addressesList || [];
        const address = addressList.find((addr: UserAddress) => addr.id === id);

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
          setCoordinates(address.coordinates || null);
        } else {
          showToast('Address not found', 'error');
          setTimeout(() => router.back(), 1500);
        }
      }
    } catch (error) {
      console.error('Failed to load address:', error);
      showToast('Failed to load address data', 'error');
    } finally {
      setLoading(false);
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

  const handleLocationButtonPress = async () => {
    setTempForm({ ...form });
    await handleUseCurrentLocation();
    setShowMap(true);
  };

  const handleConfirmLocation = () => {
    if (!tempCoordinates) {
      showToast('Please select a location', 'error');
      return;
    }

    setCoordinates(tempCoordinates);
    if (tempForm) {
      setForm(prev => ({
        ...prev,
        region: tempForm.region,
        province: tempForm.province,
        city: tempForm.city,
        barangay: tempForm.barangay,
        streetAddress: tempForm.streetAddress
      }));
    }

    setShowMap(false);
    setMapError(false);
    showToast('Location confirmed', 'success');
  };

  const handleCancelMap = () => {
    setTempForm(null);
    setTempCoordinates(null);
    setShowMap(false);
    setMapError(false);
  };

  const handleMapError = (error: any) => {
    console.error('Map error:', error);
    setMapError(true);
    showToast('Map failed to load. You can still enter your address manually.', 'error');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let firstErrorField: keyof FormErrors | null = null;

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

    if (firstErrorField && inputRefs[firstErrorField]?.current) {
      inputRefs[firstErrorField].current?.focus();
      showToast(newErrors[firstErrorField]!, 'error');
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (!userData) {
        showToast('You must be logged in to save an address', 'error');
        return;
      }

      const userRef = doc(db, 'users', userData.uid);
      const userSnap = await getDoc(userRef);
      const existingAddresses = userSnap.exists() ? (userSnap.data().addressesList || []) : [];

      let updatedAddresses = [...existingAddresses];

      if (isEditMode && id && originalAddress) {
        updatedAddresses = existingAddresses.map((addr: UserAddress) => {
          if (addr.id === id) {
            return {
              ...addr,
              ...form,
              coordinates: coordinates || null,
              updatedAt: new Date().toISOString()
            };
          }
          if (form.isDefault && addr.isDefault && addr.id !== id) {
            return {
              ...addr,
              isDefault: false,
              updatedAt: new Date().toISOString()
            };
          }
          return addr;
        });
      } else {
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
      }

      await updateDoc(userRef, {
        addressesList: updatedAddresses
      });

      showToast(
        isEditMode ? 'Address updated successfully' : 'Address saved successfully',
        'success'
      );

      setTimeout(() => router.back(), 1000);
    } catch (error) {
      console.error('Save address error:', error);
      showToast('Failed to save address. Please try again.', 'error');
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
            <Text className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Edit Address' : 'Add New Address'}
            </Text>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EC4899" />
          <Text className="text-gray-600 mt-4">Loading address...</Text>
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
          <Text className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Address' : 'Add New Address'}
          </Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 40 : 120}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: Platform.OS === 'ios' ? 100 : 120
        }}
      >
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
              className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${errors.fullName ? 'border-red-500' : 'border-gray-200'
                }`}
              placeholderTextColor="#9CA3AF"
            />
            {errors.fullName && (
              <Text className="text-red-500 text-xs mt-1">{errors.fullName}</Text>
            )}
          </View>

          <View className="mb-4">
            <View className="flex-row items-center bg-gray-50 border rounded-lg px-4 py-3 border-gray-200">
              <Text className="text-gray-900 mr-2">+63</Text>
              <TextInput
                ref={inputRefs.phoneNumber}
                value={form.phoneNumber}
                onChangeText={(text) => {
                  let formatted = text;

                  // Remove any non-digit characters
                  formatted = formatted.replace(/[^0-9]/g, '');

                  // Remove leading 0 if user types it
                  if (formatted.startsWith('0')) {
                    formatted = formatted.slice(1);
                  }

                  // Limit to 10 digits
                  if (formatted.length > 10) {
                    formatted = formatted.slice(0, 10);
                  }

                  updateForm('phoneNumber', formatted);
                }}
                placeholder="9123456789"
                keyboardType="phone-pad"
                maxLength={10} // 10 digits after +63
                className="flex-1 text-gray-900"
                placeholderTextColor="#9CA3AF"
              />
            </View>


            {errors.phoneNumber && (
              <Text className="text-red-500 text-xs mt-1">{errors.phoneNumber}</Text>
            )}
          </View>
        </View>

        {/* Location Button */}
        <TouchableOpacity
          onPress={handleLocationButtonPress}
          disabled={loadingLocation}
          className="bg-white rounded-xl p-4 mb-3 border border-gray-200 flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          {loadingLocation ? (
            <>
              <ActivityIndicator size="small" color="#EC4899" />
              <Text className="text-gray-600 ml-2">Getting location...</Text>
            </>
          ) : (
            <>
              <Ionicons name="location" size={20} color="#EC4899" />
              <Text className="text-pink-500 font-semibold text-base ml-2">
                {coordinates ? 'Update Location' : 'Use My Current Location'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Location Error Message */}
        {locationError && (
          <View className="bg-red-50 rounded-lg p-3 mb-3 flex-row items-start">
            <Ionicons name="alert-circle" size={20} color="#EF4444" style={{ marginTop: 2 }} />
            <Text className="text-red-700 text-sm ml-2 flex-1">{locationError}</Text>
          </View>
        )}

        {/* Current coordinates saved indicator */}
        {coordinates && (
          <View className="bg-blue-50 rounded-lg p-3 mb-3 flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
            <Text className="text-blue-700 text-sm ml-2 flex-1">
              Location coordinates saved
            </Text>
          </View>
        )}

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
              className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${errors.province ? 'border-red-500' : 'border-gray-200'
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
              className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${errors.city ? 'border-red-500' : 'border-gray-200'
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
              className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${errors.barangay ? 'border-red-500' : 'border-gray-200'
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
              className={`bg-gray-50 border rounded-lg px-4 py-3 text-gray-900 ${errors.streetAddress ? 'border-red-500' : 'border-gray-200'
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
          <View className={`w-12 h-7 rounded-full items-center ${form.isDefault ? 'bg-pink-500 justify-end' : 'bg-gray-300 justify-start'
            } flex-row px-1`}>
            <View className="w-5 h-5 bg-white rounded-full shadow-sm" />
          </View>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      {/* Save Button */}
      <SafeAreaView edges={["bottom"]} className="bg-gray-50 border-t border-gray-200">
        <View className="px-4 py-3">
          <TouchableOpacity
            onPress={handleSaveAddress}
            disabled={saving}
            className="bg-pink-500 py-3.5 rounded-xl shadow-sm"
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-center text-base">
                {isEditMode ? 'Update Address' : 'Save Address'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Map Modal */}
      <Modal
        visible={showMap}
        animationType="slide"
        onRequestClose={handleCancelMap}
        presentationStyle="pageSheet"
        statusBarTranslucent={true}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {/* Header */}
          <View className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center justify-between">
            <TouchableOpacity onPress={handleCancelMap} className="p-2 -ml-2">
              <Ionicons name="close" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Select Location</Text>
            <TouchableOpacity
              onPress={handleConfirmLocation}
              className="p-2 -mr-2"
              disabled={!tempCoordinates}
            >
              <Text className={`font-semibold text-base ${tempCoordinates ? 'text-pink-500' : 'text-gray-400'
                }`}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>

          {/* Map Container */}
          <View style={{ flex: 1 }}>
            {!mapError ? (
              <WebView
                ref={webViewRef}
                source={{ html: generateMapHTML() }}
                onMessage={handleWebViewMessage}
                onError={handleMapError}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <View className="flex-1 items-center justify-center bg-gray-100">
                    <ActivityIndicator size="large" color="#EC4899" />
                    <Text className="text-gray-600 mt-2">Loading map...</Text>
                  </View>
                )}
              />
            ) : (
              // Map Error Fallback
              <View className="flex-1 items-center justify-center bg-gray-100 p-6">
                <View className="bg-white rounded-2xl p-6 items-center shadow-sm w-full max-w-sm">
                  <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="map-outline" size={40} color="#EF4444" />
                  </View>
                  <Text className="text-lg font-bold text-gray-900 mb-2 text-center">
                    Map Unavailable
                  </Text>
                  <Text className="text-sm text-gray-600 text-center mb-4">
                    The map couldn't be loaded. You can still enter your address manually.
                  </Text>
                  <TouchableOpacity
                    onPress={handleCancelMap}
                    className="bg-pink-500 py-3 px-6 rounded-lg w-full"
                  >
                    <Text className="text-white font-semibold text-center">
                      Enter Address Manually
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setMapError(false);
                      setShowMap(true);
                    }}
                    className="mt-3 py-2"
                  >
                    <Text className="text-pink-500 font-medium">Try Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Address Info Card - Overlay */}
            {!mapError && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0
                }}
                className="bg-white p-4 border-t border-gray-200"
              >
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
                          {tempForm?.streetAddress || 'Address not found'}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-1">
                          {[tempForm?.barangay, tempForm?.city, tempForm?.province]
                            .filter(Boolean)
                            .join(', ') || 'Move the pin to select location'}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-gray-400 mt-3 text-center">
                      Drag the pin or tap the map to adjust your location
                    </Text>
                  </>
                )}
              </View>
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