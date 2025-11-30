// components/seller/sellerShopScreen/EditShopForm.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';

interface EditShopFormProps {
  initialData: {
    shopName: string;
    businessName: string;
    addressLocation: string;
    contactNumber: string;
    email: string;
    description: string;
  };
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const EditShopForm: React.FC<EditShopFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.addressLocation.trim()) {
      newErrors.addressLocation = 'Address is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Invalid contact number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      Alert.alert('Success', 'Shop details updated successfully');
      onCancel();
    } catch (error) {
      Alert.alert('Error', 'Failed to update shop details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-900">Edit Shop Details</Text>
        <TouchableOpacity onPress={onCancel}>
          <X size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Shop Name */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Shop Name *
          </Text>
          <TextInput
            value={formData.shopName}
            onChangeText={(text) => setFormData({ ...formData, shopName: text })}
            placeholder="Enter shop name"
            className={`border ${
              errors.shopName ? 'border-red-500' : 'border-gray-300'
            } rounded-lg px-4 py-3 text-gray-900`}
          />
          {errors.shopName && (
            <Text className="text-red-500 text-xs mt-1">{errors.shopName}</Text>
          )}
        </View>

        {/* Business Name */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Business Name *
          </Text>
          <TextInput
            value={formData.businessName}
            onChangeText={(text) =>
              setFormData({ ...formData, businessName: text })
            }
            placeholder="Enter business name"
            className={`border ${
              errors.businessName ? 'border-red-500' : 'border-gray-300'
            } rounded-lg px-4 py-3 text-gray-900`}
          />
          {errors.businessName && (
            <Text className="text-red-500 text-xs mt-1">{errors.businessName}</Text>
          )}
        </View>

        {/* Address */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Address Location *
          </Text>
          <TextInput
            value={formData.addressLocation}
            onChangeText={(text) =>
              setFormData({ ...formData, addressLocation: text })
            }
            placeholder="Enter address"
            multiline
            numberOfLines={3}
            className={`border ${
              errors.addressLocation ? 'border-red-500' : 'border-gray-300'
            } rounded-lg px-4 py-3 text-gray-900`}
            style={{ textAlignVertical: 'top' }}
          />
          {errors.addressLocation && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.addressLocation}
            </Text>
          )}
        </View>

        {/* Contact Number */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Contact Number *
          </Text>
          <TextInput
            value={formData.contactNumber}
            onChangeText={(text) =>
              setFormData({ ...formData, contactNumber: text })
            }
            placeholder="Enter contact number"
            keyboardType="phone-pad"
            className={`border ${
              errors.contactNumber ? 'border-red-500' : 'border-gray-300'
            } rounded-lg px-4 py-3 text-gray-900`}
          />
          {errors.contactNumber && (
            <Text className="text-red-500 text-xs mt-1">{errors.contactNumber}</Text>
          )}
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Email *
          </Text>
          <TextInput
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            className={`border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-lg px-4 py-3 text-gray-900`}
          />
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
          )}
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Description
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Tell customers about your shop..."
            multiline
            numberOfLines={4}
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            style={{ textAlignVertical: 'top' }}
            maxLength={200}
          />
          <Text className="text-xs text-gray-500 mt-1 text-right">
            {formData.description.length}/200
          </Text>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View className="px-4 py-3 border-t border-gray-200 flex-row gap-3">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 py-3 rounded-lg border border-gray-300"
          disabled={loading}
        >
          <Text className="text-center font-semibold text-gray-700">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          className="flex-1 py-3 rounded-lg bg-pink-600"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center font-semibold text-white">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};