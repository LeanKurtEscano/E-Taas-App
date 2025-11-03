import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { useLocalSearchParams } from 'expo-router';
import { auth } from '@/config/firebaseConfig';
import { router } from 'expo-router';
import { onAuthStateChanged } from "firebase/auth";

const CheckEmailScreen = () => {
 
  const { email, type } = useLocalSearchParams<{ email: string, type: string }>();

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setError('');

    try {
      if (type === 'reset') {
        await sendPasswordResetEmail(auth, email);
      } else {
        const user = auth.currentUser;
        if (user) {
          await sendEmailVerification(user);
        } else {
          await new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
              unsubscribe();
              if (currentUser) {
                await sendEmailVerification(currentUser);
              } else {
                reject(new Error("No user found. Please log in again."));
              }
            });
          });
        }
      }

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error("Resend failed:", error);
      setError(error.message || "Failed to send email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const title = type === "reset" ? "Check your email" : "Verify your email";
  const message = type === "reset" 
    ? "We have sent a password reset link to your email address" 
    : "We have sent a verification link to your email address";

  return (
    <ScrollView 
      className="flex-1 bg-pink-500"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Top Section - Pink Background */}
      <View className="items-center justify-center px-8 pt-40 pb-12">
        {/* Email Icon with Checkmark */}
        <View className="w-32 h-32 bg-white rounded-full items-center justify-center mb-10 shadow-lg">
          <View className="w-20 h-20 items-center justify-center">
            {/* Envelope */}
            <View className="w-16 h-12 border-4 border-pink-400 rounded-lg relative">
              {/* Envelope flap */}
              <View className="absolute -top-3 left-0 right-0 items-center">
                <View className="w-16 h-6 bg-pink-400" style={{ 
                  transform: [{ rotate: '0deg' }],
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8
                }} />
              </View>
            </View>
            {/* Checkmark badge */}
            <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-pink-400 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white font-bold text-lg">✓</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-bold mb-6 text-center leading-tight">
          {title}
        </Text>

        {/* Description */}
        <Text className="text-white/95 text-center text-base mb-4 px-6 leading-relaxed">
          {message}
        </Text>

        {/* Email Address - Highlighted */}
        <View className="bg-white/20 rounded-xl px-6 py-3 mb-6">
          <Text className="text-white text-center text-base font-semibold">
            {email}
          </Text>
        </View>

        {/* Instructions */}
        <Text className="text-white/90 text-center text-sm px-4 leading-relaxed">
          Click the link in the email to continue.{'\n'}
          If you don't see it, check your spam folder.
        </Text>
      </View>

      {/* Bottom Section - White Background */}
      <View className="bg-white flex-1 rounded-t-3xl px-6 py-10 mt-2">
        {/* Success Message */}
        {resendSuccess && (
          <View className="bg-green-50 border-2 border-green-400 rounded-2xl px-4 py-4 mb-6">
            <Text className="text-green-700 text-center font-semibold text-base">
              ✓ Email sent successfully!
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View className="bg-red-50 border-2 border-red-400 rounded-2xl px-4 py-4 mb-6">
            <Text className="text-red-700 text-center font-medium text-sm">
              {error}
            </Text>
          </View>
        )}

        {/* Resend Button - Only for reset type */}
        {type === 'reset' && ( 
          <TouchableOpacity
            onPress={handleResend}
            disabled={isResending}
            className={`bg-pink-400 rounded-2xl py-5 mb-5 shadow-sm ${isResending ? 'opacity-50' : ''}`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isResending ? 'Sending...' : 'Resend Email'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Back to Login Link */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)')}
          className="py-4"
          activeOpacity={0.6}
        >
          <Text className="text-pink-500 text-center text-base font-semibold">
            Back to Login
          </Text>
        </TouchableOpacity>

        {/* Help Text */}
        <View className="mt-8 px-4">
          <Text className="text-gray-400 text-center text-sm leading-relaxed">
            Didn't receive the email?{'\n'}
            Check your spam folder or try resending.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CheckEmailScreen;

// USAGE EXAMPLE:
// In your navigation file, pass parameters like this:
/*
navigation.navigate('CheckEmail', {
  email: userEmail,
  type: 'reset' // or 'verification'
});
*/

// FIREBASE SETUP:
// Make sure you pass the auth instance as a prop or import it from your firebase config
/*
import { auth } from './firebase-config';

<CheckEmailScreen 
  route={route}
  navigation={navigation}
  auth={auth}
/>
*/