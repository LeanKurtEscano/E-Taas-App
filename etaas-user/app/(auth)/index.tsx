// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react-native';
import { Image } from 'react-native';
import { router } from 'expo-router';
import { authApiClient } from '@/config/general/auth';
import { useCurrentUser } from '@/store/useCurrentUserStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const mapUserFromBackend = useCurrentUser((state) => state.mapUserFromBackend);
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const {setUserData} = useCurrentUser();
  // Clear errors when user types
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError('');
    setGeneralError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError('');
    setGeneralError('');
  };

  const validateInputs = (): boolean => {
    let isValid = true;
    
    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      }
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleEmailSignIn = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setGeneralError('');

    try {
      const response = await authApiClient.post('/login', {
        email: email.trim(),
        password: password,
      });

      if (response.data.success) {
        mapUserFromBackend(response.data.user);
        AsyncStorage.setItem('etaas_access_token', response.data.user.access_token);
        
        router.push('/(tabs)');
      }
    } catch (error: any) {
    
      if (error.response) {

        const status = error.response.status;
        const detail = error.response.data?.detail || 'An error occurred';

        if (status === 401) {
          // Invalid credentials
          setGeneralError('Invalid email or password');
        } else if (status === 500) {
          setGeneralError('Server error. Please try again later');
        } else if (status === 422) {
          // Validation error
          setGeneralError('Please check your input and try again');
        } else {
          setGeneralError(detail);
        }
      } else if (error.request) {
        // Network error
        setGeneralError('Network error. Please check your internet connection');
      } else {
        // Other errors
        setGeneralError('An unexpected error occurred. Please try again');
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
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View className="rounded-b-[40px] pt-36 pb-12 items-center px-6">
          <View className="w-28 h-28 rounded-md bg-white items-center justify-center mb-6">
            <View className="w-24 h-24 overflow-hidden">
              <Image
                source={require("../../assets/images/etaas.png")}
                className="w-full h-full p-1"
                resizeMode="cover"
              />
            </View>
          </View>

          <Text className="text-white text-3xl font-bold mb-2">E-TAAS</Text>
          <Text className="text-white text-md opacity-90">Sign in to continue</Text>
        </View>

        <View className="flex-1 bg-white rounded-t-[40px] px-9 pt-8">
          {/* General Error Message */}
          {generalError ? (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-600 text-sm">{generalError}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Email</Text>
            <View className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
              emailError ? 'border-red-400' : 'border-gray-200'
            }`}>
              <Mail size={20} color={emailError ? '#f87171' : '#9ca3af'} />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>
            {emailError ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{emailError}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View className="mb-2">
            <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
            <View className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
              passwordError ? 'border-red-400' : 'border-gray-200'
            }`}>
              <Lock size={20} color={passwordError ? '#f87171' : '#9ca3af'} />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="ml-2"
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={20} color={passwordError ? '#f87171' : '#9ca3af'} />
                ) : (
                  <Eye size={20} color={passwordError ? '#f87171' : '#9ca3af'} />
                )}
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{passwordError}</Text>
            ) : null}
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/forgotPassword')} 
            className="self-end mb-6"
          >
            <Text className="text-pink-400 font-semibold text-sm">Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleEmailSignIn}
            disabled={loading}
            className={`bg-pink-500 rounded-xl py-4 items-center mb-6 ${
              loading ? 'opacity-50' : ''
            }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-pink-400 text-sm font-semibold">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}