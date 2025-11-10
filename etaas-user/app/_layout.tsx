import { Stack, useRouter, useSegments } from "expo-router";
import "../global.css";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    // Reload user to get fresh emailVerified status
    const checkEmailVerification = async () => {
      if (user && !user.emailVerified) {
        await user.reload();
      }
    };

    checkEmailVerification();

    if (!user && !inAuthGroup) {
      // No user, redirect to auth
      router.replace("/(auth)");
    } else if (user && inAuthGroup) {
      // User exists and is in auth group
      // Only redirect to tabs if email is verified
      if (user.emailVerified) {
        router.replace("/(tabs)");
      }
      // If email is NOT verified, stay in auth group (don't redirect)
    } else if (user && !user.emailVerified && !inAuthGroup) {
      // User is not verified but trying to access non-auth screens
      // Keep them in auth
      router.replace({
        pathname: '/(auth)/emailSent',
        params: { email: user.email, type: 'verification' }
      });
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}