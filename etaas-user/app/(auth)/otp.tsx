import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      alert('Please enter the complete OTP');
      return;
    }

    // TODO: Send OTP to server for verification
    // try {
    //   const response = await fetch('YOUR_API_ENDPOINT/verify-otp', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       otp: otpCode,
    //       // Add other required fields like email, phone, etc.
    //     }),
    //   });
    //   const data = await response.json();
    //   if (data.success) {
    //     // Navigate to next screen or show success message
    //   }
    // } catch (error) {
    //   console.error('OTP verification failed:', error);
    // }

    console.log('Verifying OTP:', otpCode);
  };

  const handleResendOTP = async () => {
    // TODO: Resend OTP functionality
    // try {
    //   const response = await fetch('YOUR_API_ENDPOINT/resend-otp', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       // Add required fields like email, phone, etc.
    //     }),
    //   });
    // } catch (error) {
    //   console.error('Resend OTP failed:', error);
    // }

    setTimer(300); // Reset timer
    setOtp(['', '', '', '', '', '']); // Clear OTP inputs
    inputRefs.current[0]?.focus();
    console.log('Resending OTP...');
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
        <Text className="text-white text-3xl font-bold mb-2">
          E-Taas App
        </Text>

        {/* Subtitle */}
        <Text className="text-white text-lg font-semibold mb-2">
          Enter OTP Code
        </Text>

        {/* Description */}
        <Text className="text-white/90 text-center text-sm mb-2">
          We've sent a 6-digit code to your email
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
              className="w-12 h-14 bg-white rounded-lg text-center text-2xl font-bold text-pink-500"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerifyOTP}
          className="bg-white rounded-full py-4 px-12 mb-4 w-full max-w-sm"
        >
          <Text className="text-pink-500 text-center font-bold text-lg">
            Verify
          </Text>
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="flex-row items-center justify-center">
          <Text className="text-white/90 text-sm">
            Didn't receive the code?{' '}
          </Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={timer > 0}>
            <Text
              className={`font-bold text-sm ${
                timer > 0 ? 'text-white/50' : 'text-white underline'
              }`}
            >
              Resend
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <TouchableOpacity className="mt-6">
          <Text className="text-white/80 text-sm underline">
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}