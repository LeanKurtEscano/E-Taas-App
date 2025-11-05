import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Package, Truck, CheckCircle2, MapPin, Phone, User, Clock, ShoppingBag, CreditCard } from 'lucide-react-native'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebaseConfig'

interface OrderItem {
  image: string
  price: number
  productId: string
  productName: string
  quantity: number
  sellerId: string
  shopName: string
  variantId: string | null
  variantText: string
}

interface ShippingAddress {
  barangay: string
  city: string
  fullName: string
  phoneNumber: string
  province: string
  region: string
  streetAddress: string
}

interface OrderData {
  confirmedAt: any
  createdAt: any
  items: OrderItem[]
  orderReceivedAt: any
  paymentStatus: string
  sellerId: string
  shippedAt: any
  shippingAddress: ShippingAddress
  shippingFee: number
  shippingLink: string
  shopName: string
  status: string
  totalAmount: number
  totalPayment: number
  userId: string
}

const OrderDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      const orderRef = doc(db, 'orders', id)
      const orderSnap = await getDoc(orderRef)

      if (orderSnap.exists()) {
        setOrderData(orderSnap.data() as OrderData)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
      case 'shipped':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
      case 'confirmed':
        return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' }
      case 'pending':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
    }
  }

  const getPaymentStatusColor = (status: string) => {
    return status === 'paid' 
      ? { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
      : { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-pink-50 items-center justify-center mb-4">
            <ActivityIndicator size="large" color="#ec4899" />
          </View>
          <Text className="text-base font-semibold text-gray-800">Loading order details</Text>
          <Text className="text-sm text-gray-500 mt-1">Please wait...</Text>
        </View>
      </View>
    )
  }

  if (!orderData) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-6">
          <Package size={48} color="#9ca3af" strokeWidth={1.5} />
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</Text>
        <Text className="text-base text-gray-500 text-center mb-8">We couldn't find this order. Please check the order ID and try again.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-pink-500 px-8 py-4 rounded-2xl shadow-sm active:bg-pink-600"
        >
          <Text className="text-white font-semibold text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const statusColors = getStatusColor(orderData.status)
  const paymentColors = getPaymentStatusColor(orderData.paymentStatus)

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View className="bg-white">
        <View className="pt-12 pb-6 px-5">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-11 h-11 items-center justify-center rounded-xl bg-gray-50 active:bg-gray-100"
            >
              <ArrowLeft size={22} color="#1f2937" strokeWidth={2} />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-900">Order Details</Text>
            </View>
            <View className="w-11" />
          </View>
        </View> 
      </View> 

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
      
        <View className="bg-white mx-5 mt-5 rounded-3xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-full bg-pink-500 items-center justify-center">
              <Clock size={20} color="#ffffff" strokeWidth={2.5} />
            </View>
            <Text className="text-lg font-bold text-gray-900 ml-3">Order Timeline</Text>
          </View>

          <View className="space-y-1">
     
            <View className="flex-row items-start pb-6">
              <View className="items-center mr-4">
                <View className="w-12 h-12 rounded-2xl bg-pink-500 items-center justify-center shadow-sm">
                  <Package size={20} color="#ffffff" strokeWidth={2.5} />
                </View>
                <View className="w-0.5 h-full bg-pink-200 absolute top-12" />
              </View>
              <View className="flex-1 pt-1">
                <Text className="text-base font-bold text-gray-900 mb-1">Order Placed</Text>
                <Text className="text-sm text-gray-500">{formatDate(orderData.createdAt)}</Text>
              </View>
            </View>

          
            {orderData.confirmedAt && (
              <View className="flex-row items-start pb-6">
                <View className="items-center mr-4">
                  <View className="w-12 h-12 rounded-2xl bg-pink-500 items-center justify-center shadow-sm">
                    <CheckCircle2 size={20} color="#ffffff" strokeWidth={2.5} />
                  </View>
                  <View className="w-0.5 h-full bg-pink-200 absolute top-12" />
                </View>
                <View className="flex-1 pt-1">
                  <Text className="text-base font-bold text-gray-900 mb-1">Order Confirmed</Text>
                  <Text className="text-sm text-gray-500">{formatDate(orderData.confirmedAt)}</Text>
                </View>
              </View>
            )}

            {orderData.shippedAt && (
              <View className="flex-row items-start pb-6">
                <View className="items-center mr-4">
                  <View className="w-12 h-12 rounded-2xl bg-pink-500 items-center justify-center shadow-sm">
                    <Truck size={20} color="#ffffff" strokeWidth={2.5} />
                  </View>
                  {orderData.orderReceivedAt && <View className="w-0.5 h-full bg-pink-200 absolute top-12" />}
                </View>
                <View className="flex-1 pt-1">
                  <Text className="text-base font-bold text-gray-900 mb-1">Order Shipped</Text>
                  <Text className="text-sm text-gray-500">{formatDate(orderData.shippedAt)}</Text>
                </View>
              </View>
            )}

          
            {orderData.orderReceivedAt && (
              <View className="flex-row items-start">
                <View className="items-center mr-4">
                  <View className="w-12 h-12 rounded-2xl bg-emerald-500 items-center justify-center shadow-sm">
                    <CheckCircle2 size={20} color="#ffffff" strokeWidth={2.5} />
                  </View>
                </View>
                <View className="flex-1 pt-1">
                  <Text className="text-base font-bold text-gray-900 mb-1">Order Delivered</Text>
                  <Text className="text-sm text-gray-500">{formatDate(orderData.orderReceivedAt)}</Text>
                </View>
              </View>
            )}
          </View>

      
          {orderData.status == "shipped"&& (
            <TouchableOpacity onPress={() => router.push('/orders/toship')} className="mt-6 bg-gradient-to-r from-pink-500 to-pink-600 p-4 rounded-2xl shadow-sm active:opacity-90">
              <Text className="text-white font-bold text-center text-base">Track Shipment</Text>
            </TouchableOpacity>
          )}
        </View>

      
        <View className="bg-white mx-5 mt-5 rounded-3xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-14 h-14 rounded-2xl bg-pink-500 items-center justify-center shadow-sm">
                <ShoppingBag size={24} color="#ffffff" strokeWidth={2.5} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Shop</Text>
                <Text className="text-lg font-bold text-gray-900">{orderData.shopName}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white mx-5 mt-5 rounded-3xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-5">
            <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center">
              <Package size={20} color="#ec4899" strokeWidth={2.5} />
            </View>
            <Text className="text-lg font-bold text-gray-900 ml-3">Order Items</Text>
            <View className="ml-auto bg-gray-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-bold text-gray-600">{orderData.items.length} {orderData.items.length === 1 ? 'item' : 'items'}</Text>
            </View>
          </View>

          {orderData.items.map((item, index) => (
            <View
              key={index}
              className={`flex-row items-center ${index !== orderData.items.length - 1 ? 'mb-5 pb-5 border-b border-gray-100' : ''}`}
            >
              <View className="relative">
                <Image
                  source={{ uri: item.image }}
                  className="w-24 h-24 rounded-2xl bg-gray-100"
                  resizeMode="cover"
                />
                <View className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-pink-500 items-center justify-center shadow-sm">
                  <Text className="text-white text-xs font-bold">{item.quantity}</Text>
                </View>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={2}>
                  {item.productName}
                </Text>
                {item.variantText && (
                  <Text className="text-sm text-gray-500 mb-2">{item.variantText}</Text>
                )}
                <Text className="text-lg font-bold text-pink-600">₱{item.price.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-white mx-5 mt-5 rounded-3xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-5">
            <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center">
              <MapPin size={20} color="#ec4899" strokeWidth={2.5} />
            </View>
            <Text className="text-lg font-bold text-gray-900 ml-3">Delivery Address</Text>
          </View>

          <View className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-white items-center justify-center mr-3">
                <User size={16} color="#6b7280" strokeWidth={2} />
              </View>
              <Text className="text-base font-semibold text-gray-900">{orderData.shippingAddress.fullName}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-white items-center justify-center mr-3">
                <Phone size={16} color="#6b7280" strokeWidth={2} />
              </View>
              <Text className="text-base text-gray-700">{orderData.shippingAddress.phoneNumber}</Text>
            </View>

            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-lg bg-white items-center justify-center mr-3 mt-0.5">
                <MapPin size={16} color="#6b7280" strokeWidth={2} />
              </View>
              <Text className="text-base text-gray-700 flex-1 leading-6">
                {orderData.shippingAddress.streetAddress}, {orderData.shippingAddress.barangay}, {orderData.shippingAddress.city}, {orderData.shippingAddress.province}, {orderData.shippingAddress.region}
              </Text>
            </View>
          </View>
        </View>

        
        <View className="bg-white mx-5 mt-5 rounded-3xl p-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center">
                <CreditCard size={20} color="#ec4899" strokeWidth={2.5} />
              </View>
              <Text className="text-lg font-bold text-gray-900 ml-3">Payment Summary</Text>
            </View>
            <View className={`px-4 py-1.5 rounded-full ${paymentColors.bg} border ${paymentColors.border}`}>
              <Text className={`text-xs font-bold ${paymentColors.text} uppercase tracking-wide`}>
                {orderData.paymentStatus}
              </Text>
            </View>
          </View>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Subtotal</Text>
              <Text className="text-base font-semibold text-gray-900">₱{orderData.totalAmount.toLocaleString()}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Shipping Fee</Text>
              <Text className="text-base font-semibold text-gray-900">₱{orderData.shippingFee.toLocaleString()}</Text>
            </View>
            
            <View className="border-t-2 border-dashed border-gray-200 my-2" />
            
            <View className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-900">Total Payment</Text>
                <Text className="text-2xl font-bold text-pink-600">₱{orderData.totalPayment.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mx-5 mt-5 bg-gray-100 rounded-2xl p-5 border border-gray-200">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Reference</Text>
          <Text className="text-sm font-mono text-gray-800 tracking-tight">{id}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default OrderDetailsScreen;