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
import { Lock, Mail } from 'lucide-react-native';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';

import { auth } from '../../config/firebaseConfig'; 
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


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
          Alert.alert('Success', 'Signed in with Google!');
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
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
          Alert.alert('Success', 'Signed in with Facebook!');
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
        });
    }
  }, [fbResponse]);

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      router.push('/(tabs)');
      console.log('Sign-in successful:', userCredential.user);
      Alert.alert('Success', 'Signed in successfully!');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      Alert.alert('Error', error.message);
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
      className="flex-1  bg-pink-400"
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View className=" rounded-b-[40px] pt-16 pb-12 items-center px-6">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6">
            <Lock size={40} color="#ec4899" strokeWidth={2.5} />
          </View>
          <Text className="text-white text-3xl font-bold mb-2">E-Taas App</Text>
  
          <Text className="text-white text-md opacity-90">Sign in to continue</Text>
        </View>

    
        <View className="flex-1 bg-white rounded-t-[40px] px-9 pt-8">
   
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
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
              />
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
            className={`bg-pink-400 rounded-xl py-4 items-center mb-6 ${
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