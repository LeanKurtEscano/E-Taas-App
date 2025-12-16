import { Stack, useRouter, useSegments } from "expo-router";
import "../global.css";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useCurrentUser } from "@/store/useCurrentUserStore";

function RootLayoutNav() {
  const { userData, loading, fetchCurrentUser } = useCurrentUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
     if (!userData) {
      fetchCurrentUser();
    }
  }, []);


  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
     const inTabsGroup = segments[0] === "(tabs)";
    if (!userData && !inAuthGroup) {
      // No user, redirect to auth
      router.replace("/(auth)");
    } else if (userData && !inTabsGroup && inAuthGroup) {
      // User exists and is in auth group, redirect to main app
      router.replace("/(tabs)");
    }
  }, [userData, loading, segments]);

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
  return <RootLayoutNav />;
}