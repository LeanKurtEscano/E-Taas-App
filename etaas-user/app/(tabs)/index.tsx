import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import HomeScreen from '@/screens/buyer/HomeScreen'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import SellerDashboard from '@/screens/seller/SellerDashboard'
const index = () => {
    const { userData, loading } = useCurrentUser()

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    )
  }


  if (userData?.isSeller) {
    return <SellerDashboard />
  }

  return <HomeScreen />
}

export default index