import React, { useState, useRef, useEffect } from 'react';
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
import { authApiClient } from '@/config/general/auth';

type OtpParams = {
  email?: string;
  username?: string;
  password?: string;
  type?: 'registration' | 'forgot-password';
};

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const { email, username, password, type = 'registration' } = useLocalSearchParams<OtpParams>();

  const isForgotPassword = type === 'forgot-password';

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    // Clear error state when user starts typing
    if (hasError) setHasError(false);

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if text is entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyRegistrationOTP = async (otpCode: string) => {
    if (!email || !username || !password) {
      setHasError(true);
      Alert.alert('Error', 'Missing registration information. Please start over.');
      router.replace('/(auth)/register');
      return;
    }

    const response = await authApiClient.post('/verify-email-otp', {
      email: email,
      username: username,
      password: password,
      otp: otpCode,
    });

    console.log('OTP verification response:', response.data);

    // Show success message
    Alert.alert(
      'Success!',
      'Your account has been created successfully. Please log in.',
      [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  const handleVerifyForgotPasswordOTP = async (otpCode: string) => {
    if (!email) {
      setHasError(true);
      Alert.alert('Error', 'Email not found. Please start over.');
        router.replace({
              pathname: '/(auth)/forgotPassword',
              params: {
                email: email?.toLowerCase().trim(),
              },
            });
      return;
    }

    const response = await authApiClient.post('/verify-password-reset-otp', {
      email: email,
      otp: otpCode,
    });

    if(response.status === 200) {

    router.replace({
      pathname: '/(auth)/resetPassword',
      params: {
        email: email?.toLowerCase().trim(),
      },
    });
  }

    console.log('Password reset OTP verification response:', response.data);

  
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setHasError(true);
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setHasError(false);
    
    try {
      if (isForgotPassword) {
        await handleVerifyForgotPasswordOTP(otpCode);
      } else {
        await handleVerifyRegistrationOTP(otpCode);
      }
    } catch (error: any) {
      setHasError(true);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          Alert.alert('Invalid OTP', data.detail || 'The OTP is invalid or has expired');
        } else if (status === 500) {
          Alert.alert(
            'Error',
            data.detail || 'An error occurred while verifying the OTP'
          );
        } else {
          Alert.alert('Error', data.detail || 'Failed to verify OTP');
        }
      } else if (error.request) {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection.'
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to verify OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found. Please start over.');
      router.replace(isForgotPassword ? '/(auth)/forgotassword' : '/(auth)/register');
      return;
    }

    setResendLoading(true);
    try {
      let response;
      
      if (isForgotPassword) {
        // Call the forgot password endpoint to resend OTP
        response = await authApiClient.post('/forgot-password', {
          email: email,
        });
      } else {
        // Call the register endpoint to resend OTP
        response = await authApiClient.post('/register', {
          email: email,
          username: username,
          password: password,
        });
      }

      console.log('Resend OTP response:', response.data);

      // Reset timer and OTP inputs
      setTimer(300);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      Alert.alert('Success', 'A new OTP has been sent to your email');
    } catch (error: any) {
      console.error('Resend OTP error:', error);

      if (error.response) {
        const { data } = error.response;
        Alert.alert('Error', data.detail || 'Failed to resend OTP');
      } else if (error.request) {
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Please check your internet connection.'
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to resend OTP');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const getTitle = () => {
    return isForgotPassword ? 'Reset Password' : 'Verify Email';
  };

  const getDescription = () => {
    return isForgotPassword
      ? `We've sent a 6-digit code to ${email} to verify your identity`
      : `We've sent a 6-digit code to ${email} to complete your registration`;
  };

  const getBackRoute = () => {
    return isForgotPassword ? '/(auth)/forgot-password' : '/(auth)';
  };

  const getBackText = () => {
    return isForgotPassword ? 'Back to Forgot Password' : 'Back to Login';
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
            <View className="w-8 h-8 bg-pink-500 rounded-full" />
          </View>
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-bold mb-2">E-Taas App</Text>

        {/* Subtitle */}
        <Text className="text-white text-lg font-semibold mb-2">
          {getTitle()}
        </Text>

        {/* Description */}
        <Text className="text-white/90 text-center text-sm mb-2 px-4">
          {getDescription()}
        </Text>

        {/* Timer */}
        <Text className="text-white/80 text-sm mb-8">
          OTP valid for: {formatTime(timer)}
        </Text>

        {/* OTP Input Boxes */}
        <View className="flex-row justify-center items-center mb-8 gap-2">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              className={`w-12 h-14 rounded-lg text-center text-2xl font-bold ${
                hasError
                  ? 'bg-red-100 text-red-500 border-2 border-red-500'
                  : 'bg-white text-pink-500'
              }`}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading && !resendLoading}
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerifyOTP}
          disabled={loading || resendLoading}
          className={`bg-white rounded-full py-4 px-12 mb-4 w-full max-w-sm ${
            loading || resendLoading ? 'opacity-50' : ''
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#ec4899" />
          ) : (
            <Text className="text-pink-500 text-center font-bold text-lg">
              Verify
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="flex-row items-center justify-center">
          <Text className="text-white/90 text-sm">
            Didn't receive the code?{' '}
          </Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={timer > 0 || loading || resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text
                className={`font-bold text-sm ${
                  timer > 0 || loading
                    ? 'text-white/50'
                    : 'text-white underline'
                }`}
              >
                Resend
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          className="mt-6"
          onPress={() => router.replace(getBackRoute())}
          disabled={loading || resendLoading}
        >
          <Text className="text-white/80 text-sm underline">
            {getBackText()}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}