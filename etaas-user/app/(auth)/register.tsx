import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { validateEmail, validateUsername } from '@/utils/validation/authValidation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { authApiClient } from '@/config/general/auth';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');


  const handleInputChange = (
    field: 'username' | 'email' | 'password' | 'confirmPassword',
    value: string
  ) => {
    switch (field) {
      case 'username':
        setUsername(value);
        if (usernameError) setUsernameError('');
        break;
      case 'email':
        setEmail(value);
        if (emailError) setEmailError('');
        break;
      case 'password':
        setPassword(value);
        if (passwordError) setPasswordError('');
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        if (confirmPasswordError) setConfirmPasswordError('');
        break;
    }
  };

  // Combined blur validation handler
  const handleInputBlur = (field: 'username' | 'email') => {
    switch (field) {
      case 'username':
        const usernameValidationError = validateUsername(username);
        if (usernameValidationError) setUsernameError(usernameValidationError);
        break;
      case 'email':
        const emailValidationError = validateEmail(email);
        if (emailValidationError) setEmailError(emailValidationError);
        break;
    }
  };

  const handleEmailSignUp = async () => {
    // Clear previous errors
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    // Validate username
    const usernameValidationError = validateUsername(username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      hasError = true;
    }

    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      hasError = true;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      hasError = true;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      // Send registration request to backend
      const response = await authApiClient.post('/register', {
        email: email.toLowerCase().trim(),
        username: username.toLowerCase().trim(),
        password: password,
      });

      // Backend sends OTP to email and returns success message
      console.log('Registration response:', response.data);

      // Navigate to OTP verification screen
      router.replace({
        pathname: '/(auth)/otp',
        params: {
          email: email.toLowerCase().trim(),
          username: username.toLowerCase().trim(),
          password: password,
          type: 'registration',
        },
      });
    } catch (error: any) {
   


      if (error.response) {
        const { status, data } = error.response;

        if (status === 409) {
        
          setEmailError(data.detail || 'Email already registered');
        } else if (status === 422) {
        
          Alert.alert('Validation Error', data.detail || 'Invalid input data');
        } else if (status === 500) {
        
          Alert.alert(
            'Error',
            data.detail || 'An error occurred. Please try again later.'
          );
        } else {
          Alert.alert('Error', data.detail || 'Failed to create account');
        }
      } else if (error.request) {
       
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection.'
        );
      } else {
      
        Alert.alert('Error', error.message || 'Failed to create account');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-pink-500">
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={80}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <StatusBar barStyle="light-content" />

        <View className="rounded-b-[40px] pt-20 pb-8 items-center px-6">
          <View className="w-28 h-28 rounded-lg bg-white items-center justify-center mb-6">
            <View className="w-24 h-24 overflow-hidden">
              <Image
                source={require('../../assets/images/etaas.png')}
                className="w-full h-full p-1"
                resizeMode="cover"
              />
            </View>
          </View>
          <Text className="text-white text-3xl font-bold mb-2">E-TAAS</Text>
          <Text className="text-white text-2xl font-semibold mb-3">Create Account</Text>
          <Text className="text-white text-lg opacity-90">Sign up to get started</Text>
        </View>

        <View className="flex-1 bg-white rounded-t-[40px] px-9 pt-8">
          {/* Username Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Username</Text>
            <View
              className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
                usernameError ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <User size={20} color={usernameError ? '#ef4444' : '#9ca3af'} />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Choose a username"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={(text) => handleInputChange('username', text)}
                onBlur={() => handleInputBlur('username')}
                autoCapitalize="none"
                autoComplete="username-new"
                textContentType="username"
                editable={!loading}
              />
            </View>
            {usernameError ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{usernameError}</Text>
            ) : null}
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Email</Text>
            <View
              className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
                emailError ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <Mail size={20} color={emailError ? '#ef4444' : '#9ca3af'} />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={(text) => handleInputChange('email', text)}
                onBlur={() => handleInputBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                editable={!loading}
              />
            </View>
            {emailError ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{emailError}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
            <View
              className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
                passwordError ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <Lock size={20} color={passwordError ? '#ef4444' : '#9ca3af'} />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="ml-2"
              >
                {showPassword ? (
                  <EyeOff size={20} color="#9ca3af" />
                ) : (
                  <Eye size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{passwordError}</Text>
            ) : null}
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-2">Confirm Password</Text>
            <View
              className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${
                confirmPasswordError ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <Lock size={20} color={confirmPasswordError ? '#ef4444' : '#9ca3af'} />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Confirm your password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                textContentType="newPassword"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#9ca3af" />
                ) : (
                  <Eye size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? (
              <Text className="text-red-500 text-xs mt-1 ml-1">{confirmPasswordError}</Text>
            ) : null}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleEmailSignUp}
            disabled={loading}
            className={`bg-pink-500 rounded-xl py-4 items-center mb-6 ${
              loading ? 'opacity-50' : ''
            }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)')}>
              <Text className="text-pink-400 text-sm font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}