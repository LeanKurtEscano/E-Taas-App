import { View, Text } from 'react-native'
import React from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { ActivityIndicator } from 'react-native'
import SellerProductScreen from '@/screens/seller/SellerProductScreen'
import BrowseProductsScreen from '@/screens/buyer/BrowseProductsScreen'
const Products = () => {
    const { userData, loading } = useCurrentUser()

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f472b6" />
      </View>
    )
  }


  if (userData?.isSeller) {
    return <SellerProductScreen />
  }

  return <BrowseProductsScreen />
}


export default Products