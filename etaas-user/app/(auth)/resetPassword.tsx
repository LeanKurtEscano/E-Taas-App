import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authApiClient } from '@/config/general/auth';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const { email } = useLocalSearchParams<{ email?: string }>();

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
   
   
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleResetPassword = async () => {
    // Clear previous errors
    setErrors({ newPassword: '', confirmPassword: '' });

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrors((prev) => ({ ...prev, newPassword: passwordError }));
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please start over.');
      router.replace('/(auth)/forgotPassword');
      return;
    }

    setLoading(true);

    try {
      const response = await authApiClient.post('/reset-password', {
        email: email,
        new_password: newPassword,
      });

      console.log('Password reset response:', response.data);

      Alert.alert(
        'Success!',
        'Your password has been reset successfully. Please log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(auth)');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
          Alert.alert('Error', 'Email not found. Please start over.');
          router.replace('/(auth)/forgotPassword');
        } else if (status === 500) {
          Alert.alert('Error', data.detail || 'An error occurred while resetting your password');
        } else {
          Alert.alert('Error', data.detail || 'Failed to reset password');
        }
      } else if (error.request) {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection.'
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-pink-500"
    >
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo/Icon Area */}
        <View className="w-24 h-24 bg-white rounded-full justify-center items-center mb-8">
          <View className="w-16 h-16 border-4 border-pink-500 rounded-full justify-center items-center">
            <Ionicons name="lock-closed" size={32} color="#ec4899" />
          </View>
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-bold mb-2">E-Taas App</Text>

        {/* Subtitle */}
        <Text className="text-white text-lg font-semibold mb-2">
          Reset Password
        </Text>

        {/* Description */}
        <Text className="text-white/90 text-center text-sm mb-8 px-4">
          Create a new strong password for your account
        </Text>

        {/* New Password Input */}
        <View className="w-full max-w-sm mb-4">
          <View
            className={`bg-white rounded-2xl flex-row items-center px-4 py-3 ${
              errors.newPassword ? 'border-2 border-red-500' : ''
            }`}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#ec4899" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="New Password"
              placeholderTextColor="#9ca3af"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: '' }));
                }
              }}
              secureTextEntry={!showNewPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              className="ml-2"
            >
              <Ionicons
                name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>
          {errors.newPassword ? (
            <Text className="text-red-200 text-xs mt-1 ml-2">
              {errors.newPassword}
            </Text>
          ) : null}
        </View>

        {/* Confirm Password Input */}
        <View className="w-full max-w-sm mb-6">
          <View
            className={`bg-white rounded-2xl flex-row items-center px-4 py-3 ${
              errors.confirmPassword ? 'border-2 border-red-500' : ''
            }`}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#ec4899" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Confirm Password"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }
              }}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="ml-2"
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text className="text-red-200 text-xs mt-1 ml-2">
              {errors.confirmPassword}
            </Text>
          ) : null}
        </View>

        {/* Password Requirements */}
        <View className="w-full max-w-sm mb-6 bg-white/10 rounded-2xl p-4">
          <Text className="text-white font-semibold mb-2 text-sm">
            Password must contain:
          </Text>
          <Text className="text-white/90 text-xs mb-1">• At least 8 characters</Text>
          <Text className="text-white/90 text-xs mb-1">• One uppercase letter</Text>
          <Text className="text-white/90 text-xs mb-1">• One lowercase letter</Text>
          <Text className="text-white/90 text-xs">• One number</Text>
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={loading}
          className={`bg-white rounded-full py-4 px-12 mb-4 w-full max-w-sm ${
            loading ? 'opacity-50' : ''
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#ec4899" />
          ) : (
            <Text className="text-pink-500 text-center font-bold text-lg">
              Reset Password
            </Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          className="mt-2"
          onPress={() => router.replace('/(auth)')}
          disabled={loading}
        >
          <Text className="text-white/80 text-sm underline">
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}