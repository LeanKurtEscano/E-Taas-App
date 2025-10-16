import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View, Platform, StatusBar } from 'react-native'
import { Tabs, Redirect } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/config/firebaseConfig'
import { AppHeader } from '@/components/general/AppHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
const TabsLayout = () => {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [cartCount] = useState<number>(3)
  const [loading, setLoading] = useState(true)

  const handleCartPress = (): void => {
    console.log('Navigate to cart')
    // Add navigation logic here
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

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
        cartCount={cartCount}
        onCartPress={handleCartPress}
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