import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig'; // Adjust import path as needed
import { useCurrentUser } from '@/hooks/useCurrentUser'; // Adjust import path as needed
import {
  ArrowLeft,
  Store,
  User,
  MapPin,
  Phone,
  Mail,
  Building2,
  CheckCircle,
} from 'lucide-react-native';
import { router } from 'expo-router';

interface SellerFormData {
  name: string;
  businessName: string;
  shopName: string;
  addressLocation: string;
  addressOfOwner: string;
  contactNumber: string;
  email: string;
}

const RegisterAsSeller = () => {
  const navigation = useNavigation();
  const { userData } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SellerFormData>({
    name: '',
    businessName: '',
    shopName: '',
    addressLocation: '',
    addressOfOwner: '',
    contactNumber: '',
    email: userData?.email || '',
  });

  const handleInputChange = (field: keyof SellerFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.name ||
      !formData.businessName ||
      !formData.shopName ||
      !formData.addressLocation ||
      !formData.addressOfOwner ||
      !formData.contactNumber ||
      !formData.email
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Phone validation
    if (formData.contactNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid contact number');
      return;
    }

    setLoading(true);

    try {
      // Update user document in Firebase
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        sellerInfo: {
          name: formData.name,
          businessName: formData.businessName,
          shopName: formData.shopName,
          addressLocation: formData.addressLocation,
          addressOfOwner: formData.addressOfOwner,
          contactNumber: formData.contactNumber,
          email: formData.email,
          registeredAt: new Date().toISOString(),
        },
        isSeller: true,
      });

      Alert.alert('Success', 'Successfully registered as seller!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/profile'),
        },
      ]);
    } catch (error) {
      console.error('Error registering as seller:', error);
      Alert.alert('Error', 'Failed to register as seller. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      {/* Header */}
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

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Hero Section */}
        <View className="bg-pink-400 mx-4 mt-6 rounded-2xl p-6 ">
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
            Personal Information
          </Text>

          {/* Name */}
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-pink-50 p-2 rounded-lg">
                <User size={18} color="#DB2777" strokeWidth={2} />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Full Name *
              </Text>
            </View>
            <TextInput
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="John Doe"
              className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-lg"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Email */}
          <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-pink-50 p-2 rounded-lg">
                <Mail size={18} color="#DB2777" strokeWidth={2} />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Email Address *
              </Text>
            </View>
            <TextInput
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="john.doe@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-lg"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Contact Number */}
          <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-pink-50 p-2 rounded-lg">
                <Phone size={18} color="#DB2777" strokeWidth={2} />
              </View>
              <Text className="text-sm font-semibold text-gray-700">
                Contact Number *
              </Text>
            </View>
            <TextInput
              value={formData.contactNumber}
              onChangeText={(value) => handleInputChange('contactNumber', value)}
              placeholder="+63 912 345 6789"
              keyboardType="phone-pad"
              className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-lg"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-2">
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
              placeholder="ABC Trading Company"
              className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-lg"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Shop Name */}
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
              placeholder="John's Amazing Store"
              className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-lg"
              placeholderTextColor="#9CA3AF"
            />
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
              placeholder="123 Main Street, City, Province"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-lg min-h-[60px]"
              placeholderTextColor="#9CA3AF"
            />
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
              placeholder="456 Home Street, City, Province"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              className="text-base text-gray-900 px-3 py-2 bg-gray-50 rounded-lg min-h-[60px]"
              placeholderTextColor="#9CA3AF"
            />
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterAsSeller;