import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Building2,
  CheckCircle,
} from 'lucide-react-native';
import { router } from 'expo-router';
import useToast from '@/hooks/general/useToast';
import GeneralToast from '@/components/general/GeneralToast';
import { sellerApiClient } from '@/config/seller/seller';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface SellerFormData {
  businessName: string;
  shopName: string;
  addressLocation: string;
  addressOfOwner: string;
  contactNumber: string;
}

interface FormErrors {
  businessName: string;
  shopName: string;
  addressLocation: string;
  addressOfOwner: string;
  contactNumber: string;
}

const RegisterAsSeller = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const { showToast, toastVisible, toastMessage, toastType, setToastVisible } = useToast();
  const [formData, setFormData] = useState<SellerFormData>({
    businessName: '',
    shopName: '',
    addressLocation: '',
    addressOfOwner: '',
    contactNumber: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    businessName: '',
    shopName: '',
    addressLocation: '',
    addressOfOwner: '',
    contactNumber: '',
  });

  const handleInputChange = (field: keyof SellerFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validatePhilippineNumber = (number: string): string => {
    if (!number.trim()) {
      return 'Contact number is required.';
    }

    const cleanNumber = number.replace(/\D/g, '');

    if (cleanNumber.startsWith('09')) {
      if (cleanNumber.length !== 11) {
        return 'Philippine mobile number must be 11 digits (e.g., 09123456789).';
      }
    } else if (cleanNumber.startsWith('639')) {
      if (cleanNumber.length !== 12) {
        return 'Philippine mobile number must be 12 digits with country code (e.g., 639123456789).';
      }
    } else if (cleanNumber.startsWith('63')) {
      return 'Invalid Philippine number format. Use 09XXXXXXXXX or 639XXXXXXXXX.';
    } else {
      return 'Philippine mobile number must start with 09 or country code 639.';
    }

    return '';
  };

  const validateBusinessName = (name: string): string => {
    if (!name.trim()) {
      return 'Business name is required.';
    }
    if (name.trim().length < 2) {
      return 'Business name must be at least 2 characters long.';
    }
    return '';
  };

  const validateShopName = (name: string): string => {
    if (!name.trim()) {
      return 'Shop display name is required.';
    }
    if (name.trim().length < 2) {
      return 'Shop name must be at least 2 characters long.';
    }
    return '';
  };

  const validateAddress = (address: string, fieldName: string): string => {
    if (!address.trim()) {
      return `${fieldName} is required.`;
    }
    if (address.trim().length < 10) {
      return `${fieldName} must be at least 10 characters long.`;
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      contactNumber: validatePhilippineNumber(formData.contactNumber),
      businessName: validateBusinessName(formData.businessName),
      shopName: validateShopName(formData.shopName),
      addressLocation: validateAddress(formData.addressLocation, 'Business address'),
      addressOfOwner: validateAddress(formData.addressOfOwner, "Owner's address"),
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleBlur = (field: keyof SellerFormData) => {
    let error = '';

    switch (field) {
      case 'contactNumber':
        error = validatePhilippineNumber(formData.contactNumber);
        break;
      case 'businessName':
        error = validateBusinessName(formData.businessName);
        break;
      case 'shopName':
        error = validateShopName(formData.shopName);
        break;
      case 'addressLocation':
        error = validateAddress(formData.addressLocation, 'Business address');
        break;
      case 'addressOfOwner':
        error = validateAddress(formData.addressOfOwner, "Owner's address");
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please fix all errors before submitting.', 'error');
      return;
    }

    setLoading(true);

    try {
      const sellerInfo = {
        business_name: formData.businessName.trim(),
        business_address: formData.addressLocation.trim(),
        business_contact: formData.contactNumber.trim(),
        display_name: formData.shopName.trim(),
        owner_address: formData.addressOfOwner.trim(),
      };

      const response = await sellerApiClient.post('/apply', sellerInfo);

      if (response.status === 201) {
        showToast('Successfully registered as seller!', 'success');
        
        setTimeout(() => {
          router.replace('/(tabs)/profile');
        }, 1500);
      }

    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail;

        switch (status) {
          case 400:
            if (detail === 'User is already a seller.') {
              showToast('You are already registered as a seller.', 'error');
            } else {
              showToast(detail || 'Invalid information provided.', 'error');
            }
            break;

          case 401:
            showToast('Authentication required. Please log in again.', 'error');
            break;

          case 500:
            showToast('Server error. Please try again later.', 'error');
            break;

          default:
            showToast('Failed to register as seller. Please try again.', 'error');
        }
      } else if (error.request) {
        showToast('Network error. Please check your connection.', 'error');
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error');
      }

      console.error('Seller registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-100">
        <View className="px-4 py-3 flex-row items-center gap-3 pt-12">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            className="p-2.5 rounded-full active:bg-gray-100"
          >
            <ArrowLeft size={22} color="#1F2937" strokeWidth={2.5} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">
              Seller Registration
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              Complete your profile to start selling
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="bg-pink-500 mx-4 mt-6 rounded-2xl p-6">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="bg-white/20 p-3 rounded-full">
              <Store size={24} color="white" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">
                Become a Seller
              </Text>
              <Text className="text-pink-50 text-sm mt-0.5">
                Join E-Taas marketplace
              </Text>
            </View>
          </View>
          <View className="bg-white/10 rounded-xl p-3 mt-2">
            <Text className="text-white text-xs leading-5">
              Complete the form below to register your business and start reaching thousands of customers on our platform.
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View className="px-4 mt-6">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Business Information
          </Text>

          {/* Business Name */}
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-pink-50 p-2 rounded-lg">
                <Building2 size={18} color="#DB2777" strokeWidth={2} />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Business Name *
              </Text>
            </View>
            <TextInput
              value={formData.businessName}
              onChangeText={(value) => handleInputChange('businessName', value)}
              onBlur={() => handleBlur('businessName')}
              placeholder="ABC Trading Company"
              className={`text-base text-gray-900 px-3 py-2 rounded-lg ${
                errors.businessName ? 'bg-red-50 border border-red-300' : 'bg-gray-50'
              }`}
              placeholderTextColor="#9CA3AF"
            />
            {errors.businessName ? (
              <Text className="text-red-500 text-xs mt-2 ml-1">{errors.businessName}</Text>
            ) : null}
          </View>

          {/* Shop Display Name */}
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-pink-50 p-2 rounded-lg">
                <Store size={18} color="#DB2777" strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700">
                  Shop Display Name *
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  This is how your shop will appear to customers
                </Text>
              </View>
            </View>
            <TextInput
              value={formData.shopName}
              onChangeText={(value) => handleInputChange('shopName', value)}
              onBlur={() => handleBlur('shopName')}
              placeholder="John's Amazing Store"
              className={`text-base text-gray-900 px-3 py-2 rounded-lg ${
                errors.shopName ? 'bg-red-50 border border-red-300' : 'bg-gray-50'
              }`}
              placeholderTextColor="#9CA3AF"
            />
            {errors.shopName ? (
              <Text className="text-red-500 text-xs mt-2 ml-1">{errors.shopName}</Text>
            ) : null}
          </View>

          {/* Business Address */}
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-pink-50 p-2 rounded-lg">
                <MapPin size={18} color="#DB2777" strokeWidth={2} />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Business Address *
              </Text>
            </View>
            <TextInput
              value={formData.addressLocation}
              onChangeText={(value) => handleInputChange('addressLocation', value)}
              onBlur={() => handleBlur('addressLocation')}
              placeholder="123 Main Street, City, Province"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              className={`text-base text-gray-900 px-3 py-2 rounded-lg min-h-[60px] ${
                errors.addressLocation ? 'bg-red-50 border border-red-300' : 'bg-gray-50'
              }`}
              placeholderTextColor="#9CA3AF"
            />
            {errors.addressLocation ? (
              <Text className="text-red-500 text-xs mt-2 ml-1">{errors.addressLocation}</Text>
            ) : null}
          </View>

          {/* Contact Number */}
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-pink-50 p-2 rounded-lg">
                <Phone size={18} color="#DB2777" strokeWidth={2} />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Business Contact Number *
              </Text>
            </View>
            <TextInput
              value={formData.contactNumber}
              onChangeText={(value) => handleInputChange('contactNumber', value)}
              onBlur={() => handleBlur('contactNumber')}
              placeholder="09123456789"
              keyboardType="phone-pad"
              className={`text-base text-gray-900 px-3 py-2 rounded-lg ${
                errors.contactNumber ? 'bg-red-50 border border-red-300' : 'bg-gray-50'
              }`}
              placeholderTextColor="#9CA3AF"
            />
            {errors.contactNumber ? (
              <Text className="text-red-500 text-xs mt-2 ml-1">{errors.contactNumber}</Text>
            ) : null}
          </View>

          {/* Owner Address */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-pink-50 p-2 rounded-lg">
                <MapPin size={18} color="#DB2777" strokeWidth={2} />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Owner's Address *
              </Text>
            </View>
            <TextInput
              value={formData.addressOfOwner}
              onChangeText={(value) => handleInputChange('addressOfOwner', value)}
              onBlur={() => handleBlur('addressOfOwner')}
              placeholder="456 Home Street, City, Province"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              className={`text-base text-gray-900 px-3 py-2 rounded-lg min-h-[60px] ${
                errors.addressOfOwner ? 'bg-red-50 border border-red-300' : 'bg-gray-50'
              }`}
              placeholderTextColor="#9CA3AF"
            />
            {errors.addressOfOwner ? (
              <Text className="text-red-500 text-xs mt-2 ml-1">{errors.addressOfOwner}</Text>
            ) : null}
          </View>
        </View>

        {/* Submit Button */}
        <View className="px-4">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-pink-600 rounded-xl py-4 flex-row items-center justify-center shadow-lg active:bg-pink-700 disabled:bg-gray-300"
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <CheckCircle size={22} color="white" strokeWidth={2.5} />
                <Text className="text-white font-bold text-base ml-2">
                  Complete Registration
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text className="text-center text-xs text-gray-500 mt-4 px-4">
            By registering, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </KeyboardAwareScrollView>

      <GeneralToast
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        message={toastMessage}
        type={toastType}
      />
    </View>
  );
};

export default RegisterAsSeller;