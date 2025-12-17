import React, { useState } from 'react'
import { Platform, StatusBar, View, ActivityIndicator } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { AppHeader } from '@/components/general/AppHeader'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCurrentUser } from '@/store/useCurrentUserStore'

const TabsLayout = () => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const { userData, loading } = useCurrentUser()
  
  // Get safe area insets for proper bottom spacing
  const insets = useSafeAreaInsets()

  // TODO: Implement cart and notifications functionality
  const cartLength = 0
  const totalUnreadCount = 0
  const unreadNotifications = 0

  const handleCartPress = (): void => {
    // TODO: Navigate to cart
    console.log('Cart pressed')
  }

  const showSearch = userData?.isSeller ? false : true

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    )
  }

  if (!userData) {
    return <Redirect href="/(auth)" />
  }

  // Calculate dynamic tab bar height based on platform and safe area
  const getTabBarHeight = () => {
    if (Platform.OS === 'ios') {
      // iOS with safe area (includes home indicator)
      return 65 + insets.bottom
    } else {
      // Android - add extra padding if there's a bottom inset (gesture navigation)
      return insets.bottom > 0 ? 60 + insets.bottom : 70
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <AppHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartLength}
        onCartPress={handleCartPress}
        totalUnreadCount={totalUnreadCount}
        showSearch={showSearch}
        user={userData}
      />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#f472b6',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
            height: getTabBarHeight(),
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 10 : 5),
            paddingTop: 10,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 5,
          },
          // Customize badge appearance
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
            color: '#fff',
            fontSize: 10,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="home"
                size={focused ? 26 : 24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: 'Products',
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="shopping-bag"
                size={focused ? 26 : 24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="services"
          options={{
            title: 'Services',
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="briefcase"
                size={focused ? 26 : 24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="notification"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="bell"
                size={focused ? 26 : 24}
                color={color}
              />
            ),
            tabBarBadge: unreadNotifications > 0 ? unreadNotifications : undefined,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Feather
                name="user"
                size={focused ? 26 : 24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  )
}

export default TabsLayout