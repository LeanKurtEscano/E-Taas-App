import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View, Platform, StatusBar } from 'react-native'
import { Tabs, Redirect, router } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebaseConfig'
import { AppHeader } from '@/components/general/AppHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { db } from '@/config/firebaseConfig'
import { doc, onSnapshot } from 'firebase/firestore'
const TabsLayout = () => {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const { cartLength,totalUnreadCount } = useCurrentUser();
  const [loading, setLoading] = useState(true)
  
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const handleCartPress = (): void => {
    router.push('/cart/cart');
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])
  


useEffect(() => {
  if (!user) return

  const notifRef = doc(db, 'notifications', user.uid)

  const unsubscribe = onSnapshot(notifRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data()
      const notifications = data.notifications || []
      
      // Count only unread notifications
      const unreadCount = notifications.filter(
        (notif: any) => notif.status === 'unread'
      ).length

      setUnreadNotifications(unreadCount)
    } else {
      setUnreadNotifications(0)
    }
  })

  return () => unsubscribe()
}, [user])


  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    )
  }

  if (!user) {
    return <Redirect href="/(auth)" />
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
        showSearch={true}
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
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 10,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
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
            backgroundColor: '#ef4444', // Red color for notifications
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
            tabBarIcon: ({ color, size, focused }) => (
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
            tabBarIcon: ({ color, size, focused }) => (
              <Feather 
                name="shopping-bag" 
                size={focused ? 26 : 24} 
                color={color} 
              />
            ),
          }}
        />
        
        {/* Add Notifications Tab */}
        <Tabs.Screen
          name="notification"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, size, focused }) => (
              <Feather 
                name="bell" 
                size={focused ? 26 : 24} 
                color={color} 
              />
            ),
            // Show badge only when there are unread notifications
            tabBarBadge: unreadNotifications > 0 ? unreadNotifications : undefined,
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
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