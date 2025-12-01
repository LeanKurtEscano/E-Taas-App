// src/screens/ForgotPasswordScreen.tsx
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
import { Mail, Lock } from 'lucide-react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { validateEmail } from '@/utils/validation/authValidation';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (text: string) => {
    setEmail(text);

    if (emailError) setEmailError('');
  };


  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
     
      return false;
    }
  };

  const handleResetPassword = async () => {


    setEmailError('');

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }


    setLoading(true);
    try {

      const emailExists = await checkEmailExists(email);
      if (!emailExists) {
        setEmailError('No account found with this email address.');
        setLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      Alert.alert(
        'Email Sent',
        'Password reset instructions have been sent to your email.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.push({
                pathname: '/(auth)/emailSent',
                params: { email: email, type: 'reset' },
              })
          },
        ]
      );

      setEmail('');
    } catch (error: any) {

      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email address');
      } else {
        Alert.alert('Error', error.message || 'Failed to send password reset email');
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
      <StatusBar barStyle="light-content" backgroundColor="#ec4899" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View className="bg-pink-500 rounded-b-3xl pt-36 pb-10  items-center px-6">
          <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-4">
            <Lock size={32} color="#ec4899" strokeWidth={2.5} />
          </View>
          <Text className="text-white text-3xl font-bold mb-2">E-TAAS</Text>
          <Text className="text-white text-xl font-semibold mb-3">
            Forgot your password?
          </Text>
          <Text className="text-white text-sm opacity-90 text-center leading-5">
            A link will be sent to your email address to reset your password
          </Text>
        </View>


        <View className="px-7 flex-1 rounded-t-[40px] bg-white pt-16 pb-12">

          <View className="mb-10">
            <Text className="text-gray-800 text-base font-semibold mb-3">Email</Text>
            <View className={`flex-row items-center bg-gray-100 rounded-3xl px-5 py-4 border ${emailError ? 'border-red-500' : 'border-gray-200'} `}>
              <Mail size={24} color="#d1d5db" strokeWidth={2} />
              <TextInput
                className="flex-1 ml-4 text-gray-700 text-lg font-normal"
                placeholder="Enter your email"
                placeholderTextColor="#b4b8be"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!emailSent}
              />
            </View>

            {emailError ? (
              <Text className="text-red-500 text-md mt-1 ml-1">{emailError}</Text>
            ) : null}
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading || emailSent}
            className={`bg-pink-500 rounded-3xl py-4 items-center mb-12 ${loading ? 'opacity-70' : ''
              }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-xl font-bold">Reset</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View className="flex-row justify-center items-center">
            <TouchableOpacity onPress={() => router.push('/(auth)')} >
              <Text className="text-pink-500 text-base font-semibold ">
                Back to Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}