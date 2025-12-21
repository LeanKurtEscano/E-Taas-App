import { View, Text } from 'react-native'
import React from 'react'
import { useCurrentUser } from '@/store/useCurrentUserStore'
import { ActivityIndicator } from 'react-native'
import SellerServicesScreen from '@/screens/seller/SellerServicesScreen'
import BrowseServicesScreen from '@/screens/buyer/BrowseServicesScreen'
const services = () => {
  
const { userData, loading } = useCurrentUser()
  

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    )
  }


  if (userData?.sellerInfo?.isSellerMode) {
    return <SellerServicesScreen />
  }

  return <BrowseServicesScreen />
 
}

export default services