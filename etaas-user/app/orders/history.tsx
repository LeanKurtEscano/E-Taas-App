import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebaseConfig' 
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { FullOrderDetails, Order } from '@/types/order/userOrder'
const HistoryScreen = () => {
  const { userData } = useCurrentUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userData?.uid) return

    const ordersRef = collection(db, 'orders')
    const q = query(
      ordersRef,
      where('userId', '==', userData.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      
      setOrders(ordersData)
      setLoading(false)
    }, (error) => {

      setLoading(false)
    })

    return () => unsubscribe()
  }, [userData?.uid])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-500 bg-green-50'
      case 'shipped':
        return 'text-blue-500 bg-blue-50'
      case 'confirmed':
        return 'text-pink-500 bg-pink-50'
      case 'cancelled':
        return 'text-red-500 bg-red-50'
      default:
        return 'text-amber-500 bg-amber-50'
    }
  }

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ec4899" />
        <Text className="mt-3 text-base text-gray-500">Loading your orders...</Text>
      </View>
    )
  }

  if (orders.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {/* Header with Back Button */}
        <View className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-3 p-2 -ml-2"
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-800">
              Order History
            </Text>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">📦</Text>
          <Text className="text-xl font-semibold text-gray-800 mb-2">
            No Orders Yet
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Your order history will appear here once you make your first purchase
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with Back Button */}
      <View className="bg-white px-5 pt-14 pb-5 border-b border-gray-100">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-3 p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-gray-800">
            Order History
          </Text>
        </View>
        <Text className="text-sm text-gray-500 ml-10">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order) => (
          <View 
            key={order.id}
            className="bg-white rounded-2xl mb-4 p-4 shadow-sm border border-gray-100"
          >
            {/* Order Header */}
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100">
              <View>
                <Text className="text-xs text-gray-500 mb-1">
                  {formatDate(order.createdAt)}
                </Text>
                <Text className="text-base font-semibold text-gray-800">
                  {order.shopName}
                </Text>
              </View>
              <View className={`px-3 py-1.5 rounded-full ${getStatusColor(order.status)}`}>
                <Text className={`text-xs font-semibold ${getStatusColor(order.status).split(' ')[0]}`}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>

            {/* Order Items */}
            {order.items.map((item, index) => (
              <View 
                key={`${item.productId}-${index}`}
                className={`flex-row ${index === order.items.length - 1 ? '' : 'mb-3 pb-3 border-b border-gray-100'}`}
              >
                <Image 
                  source={{ uri: item.image }}
                  className="w-20 h-20 rounded-xl bg-gray-100"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3 justify-center">
                  <Text className="text-sm font-semibold text-gray-800 mb-1" numberOfLines={2}>
                    {item.productName}
                  </Text>
                  {item.variantText && (
                    <Text className="text-xs text-gray-500 mb-1">
                      {item.variantText}
                    </Text>
                  )}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </Text>
                    <Text className="text-base font-bold text-pink-500">
                      ₱{item.price.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Order Summary */}
            <View className="mt-3 pt-3 border-t border-gray-100">
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm text-gray-600">Subtotal</Text>
                <Text className="text-sm text-gray-800">₱{order.totalAmount?.toLocaleString() || '0.00'}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Shipping Fee</Text>
                <Text className="text-sm text-gray-800">₱{order.shippingFee?.toLocaleString() || '0.00'}</Text>
              </View>
              <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                <Text className="text-base font-bold text-gray-800">Total Payment</Text>
                <Text className="text-lg font-bold text-pink-500">₱{order.totalPayment.toLocaleString()}</Text>
              </View>
            </View>

            {/* Payment Status */}
            <View className="mt-3 pt-3 border-t border-gray-100">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">Payment Status</Text>
                <View className={`px-3 py-1 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-50' : 'bg-amber-50'}`}>
                  
                </View>
              </View>
            </View>

            {/* Shipping Link */}
            {order.shippingLink && order.status !== 'delivered' && (
              <TouchableOpacity 
                className="mt-3 bg-pink-500 py-3 rounded-xl active:bg-pink-600"
                onPress={() => {
                  
                  router.push('/orders/toship')
                }}
              >
                <Text className="text-white text-center font-semibold">
                  Track Order
                </Text>
              </TouchableOpacity>
            )}

            {/* Reorder Button for Delivered Orders */}
            {order.status === 'delivered' && (
              <TouchableOpacity 
                className="mt-3 bg-pink-50 py-3 rounded-xl active:bg-pink-100 border border-pink-200"
                onPress={() => {
                  // Add your reorder logic here
                  router.push(`/product/${order.items[0].productId}`)
                }}
              >
                <Text className="text-pink-500 text-center font-semibold">
                  Order Again
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default HistoryScreen