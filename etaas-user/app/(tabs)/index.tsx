import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import HomeScreen from '@/screens/buyer/HomeScreen'

import SellerDashboard from '@/screens/seller/SellerDashboard'
import { useCurrentUser } from '@/store/useCurrentUserStore'
const index = () => {
    const { userData, loading } = useCurrentUser();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    )
  }


  if (userData?.sellerInfo?.isSellerMode) {
    return <SellerDashboard />
  }

  return <HomeScreen />
}

export default index