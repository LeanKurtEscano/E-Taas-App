
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
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { Image } from 'react-native';
import { auth, db } from '../../config/firebaseConfig';
import { router } from 'expo-router';
import { validateEmail, validateFullName } from '@/utils/validation/validation';
WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });


  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleSocialSignIn('google', googleResponse.params.id_token);
    }
  }, [googleResponse]);


  React.useEffect(() => {
    if (fbResponse?.type === 'success') {
      handleSocialSignIn('facebook', fbResponse.params.access_token);
    }
  }, [fbResponse]);


  const handleEmailChange = (text: string) => {
    setEmail(text);

    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);

    if (passwordError) setPasswordError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);

    if (confirmPasswordError) setConfirmPasswordError('');
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);

      return false;
    }
  };


  const createUserDocument = async (userId: string, email: string, provider: string = 'email', userUId: string) => {
    try {
      const userDocRef = doc(db, 'users', userUId);
      await setDoc(userDocRef, {
        uid: userId,
        email: email.toLowerCase(),
        authProvider: provider,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false,
        profileComplete: false,
      });
      console.log('User document created successfully');
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  };


  const handleEmailSignUp = async () => {

    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;




    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      hasError = true;
    }
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

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setEmailError('An account with this email already exists');
        setLoading(false);
        return;
      }


      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user);


      await sendEmailVerification(userCredential.user);
      console.log('Verification email sent');


      await createUserDocument(
        userCredential.user.uid,
        email,
        'email',
        userCredential.user.uid
      );

      Alert.alert(
        'Success!',
        'Account created successfully! Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/(auth)/emailSent',
              params: { email: userCredential.user.email, type: 'verification' }
            }),
          },
        ]
      );
    } catch (error: any) {
      console.error('Sign-up error:', error);

      if (error.code === 'auth/email-already-in-use') {
        setEmailError('This email is already registered');
      } else if (error.code === 'auth/invalid-email') {
        setEmailError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('Password is too weak');
      } else {
        Alert.alert('Error', error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleSocialSignIn = async (provider: 'google' | 'facebook', token: string) => {
    setLoading(true);
    try {
      const credential = provider === 'google'
        ? GoogleAuthProvider.credential(token)
        : FacebookAuthProvider.credential(token);

      const result = await signInWithCredential(auth, credential);
      const user = result.user;


      const emailExists = await checkEmailExists(user.email!);

      if (!emailExists) {

        await createUserDocument(
          user.uid,
          user.email!,
          provider,
          user.uid
        );
      }

      Alert.alert('Success', `Signed in with ${provider === 'google' ? 'Google' : 'Facebook'}!`);
      router.push('/(tabs)');
    } catch (error: any) {
      console.error(`${provider} sign-in error:`, error);
      Alert.alert('Error', error.message || `Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
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

        <View className="rounded-b-[40px] pt-24 pb-12 items-center px-6">
          <View className="w-28 h-28 rounded-full bg-white items-center justify-center mb-6">
            <View className="w-24 h-24 rounded-full overflow-hidden">
              <Image
                source={require("../../assets/images/etaas.png")}
                className="w-full h-full p-1"
                resizeMode="cover"
              />
            </View>
          </View>
          <Text className="text-white text-3xl font-bold mb-2">E-Taas App</Text>
          <Text className="text-white text-2xl font-semibold mb-3">Create Account</Text>
          <Text className="text-white text-lg opacity-90">Sign up to get started</Text>
        </View>

        <View className="flex-1 bg-white rounded-t-[40px] px-9 pt-8">


          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Email</Text>
            <View className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${emailError ? 'border-red-500' : 'border-gray-200'
              }`}>
              <Mail size={20} color={emailError ? '#ef4444' : '#9ca3af'} />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={handleEmailChange}

                onBlur={() => validateEmail(email)}
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
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
            <View className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${passwordError ? 'border-red-500' : 'border-gray-200'
              }`}>
              <Lock size={20} color={passwordError ? '#ef4444' : '#9ca3af'} />
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
            <View className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border ${confirmPasswordError ? 'border-red-500' : 'border-gray-200'
              }`}>
              <Lock size={20} color={confirmPasswordError ? '#ef4444' : '#9ca3af'} />
              <TextInput
                className="flex-1 ml-3 text-gray-700 text-base"
                placeholder="Confirm your password"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}

                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password"
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
            className={`bg-pink-400 rounded-xl py-4 items-center mb-6 ${loading ? 'opacity-50' : ''
              }`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign Up</Text>
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
            onPress={() => googlePromptAsync()}
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
            onPress={() => fbPromptAsync()}
            disabled={loading || !fbRequest}
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3 mb-6"
            activeOpacity={0.8}
          >
            <Text className="text-lg text-blue-600 mr-3">f</Text>
            <Text className="text-gray-700 text-base font-medium">
              Continue with Facebook
            </Text>
          </TouchableOpacity>

          {/* Log In Link */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)')}>
              <Text className="text-pink-400 text-sm font-semibold">Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}