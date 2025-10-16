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
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { Image } from 'react-native';
import { auth } from '../../config/firebaseConfig';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          console.log('Google sign-in successful:', result.user);
          router.push('/(tabs)');
        })
        .catch((error) => {
          Alert.alert('Google Sign-In Error', getErrorMessage(error.code));
        });
    }
  }, [googleResponse]);

  React.useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { access_token } = fbResponse.params;
      const credential = FacebookAuthProvider.credential(access_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          console.log('Facebook sign-in successful:', result.user);
          router.push('/(tabs)');
        })
        .catch((error) => {
          Alert.alert('Facebook Sign-In Error', getErrorMessage(error.code));
        });
    }
  }, [fbResponse]);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('Sign-in successful:', userCredential.user);
      router.push('/(tabs)');
    } catch (error: any) {
     
      Alert.alert('Sign-In Failed', getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    googlePromptAsync();
  };

  const handleFacebookSignIn = () => {
    fbPromptAsync();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-pink-400"
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View className="rounded-b-[40px] pt-36 pb-12 items-center px-6">
          <View className="w-28 h-28 rounded-full bg-white items-center justify-center mb-6">
            <View className="w-24 h-24 rounded-full overflow-hidden">
              <Image
                source={require("../../assets/images/etaas.png")}
                className="w-full h-full p-1"
                resizeMode="cover"
              />
            </View>
          </View>

          <Text className="text-white text-3xl font-bold mb-2">E-Taas</Text>
          <Text className="text-white text-md opacity-90">Sign in to continue</Text>
        </View>

        <View className="flex-1 bg-white rounded-t-[40px] px-9 pt-8">
          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Email</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <Mail size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-2">
            <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <Lock size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
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
                  <EyeOff size={20} color="#9ca3af" />
                ) : (
                  <Eye size={20} color="#9ca3af" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => router.push('/(auth)/forgotPassword')} className="self-end mb-6">
            <Text className="text-pink-400 text-sm">Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleEmailSignIn}
            disabled={loading}
            className={`bg-pink-400 rounded-xl py-4 items-center mb-6 ${loading ? 'opacity-50' : ''}`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-400 text-sm">OR</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading || !googleRequest}
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3 mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-lg mr-3">G</Text>
            <Text className="text-gray-700 text-base font-medium">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Facebook Sign In */}
          <TouchableOpacity
            onPress={handleFacebookSignIn}
            disabled={loading || !fbRequest}
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3 mb-6"
            activeOpacity={0.8}
          >
            <Text className="text-lg text-blue-600 mr-3">f</Text>
            <Text className="text-gray-700 text-base font-medium">
              Continue with Facebook
            </Text>
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