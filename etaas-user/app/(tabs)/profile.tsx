import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import BuyerProfileScreen from '@/screens/buyer/ProfileScreen'
import SellerProfileScreen from '@/screens/seller/SellerProfileScreen'
import { useCurrentUser } from '@/store/useCurrentUserStore'

const Profile = () => {
  const { userData, loading } = useCurrentUser()

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    )
  }


  if (userData?.sellerInfo?.isSellerMode) {
    return <SellerProfileScreen />
  }

  return <BuyerProfileScreen />
}

export default Profile
