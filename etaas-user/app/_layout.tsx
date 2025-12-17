import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import "../global.css";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { useCurrentUser } from "@/store/useCurrentUserStore";

function RootLayoutNav() {
  const { userData, loading, fetchCurrentUser } = useCurrentUser();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  // Fetch user data once on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    console.log("🔍 Auth Check:", { 
      loading, 
      userData: !!userData, 
      segments,
      pathname 
    });
    
    if (loading || !hasInitialized.current) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    
    // Only redirect if we're in the wrong place
    if (!userData && !inAuthGroup) {
      console.log("➡️ No user, going to auth");
      router.replace("/(auth)");
    } else if (userData && inAuthGroup) {
      console.log("➡️ User exists, going to tabs");
      router.replace("/(tabs)");
    } else {
      console.log("✅ Already in correct location");
    }
  }, [userData, loading]);

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