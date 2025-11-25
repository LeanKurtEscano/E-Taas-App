import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Package,
  PackageCheck,
  Truck,
  ExternalLink,
  MapPin,
  Calendar,
  CheckCircle,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useToReceiveOrders } from '@/hooks/general/useToReceived';
import { formatDate } from '@/utils/general/formatDate';
import { Order } from '@/types/order/sellerOrder';
import { useNotification } from '@/hooks/general/useNotification';
import { SafeAreaView } from 'react-native-safe-area-context';

const ToReceiveScreen = () => {
  const { orders, loading } = useToReceiveOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const { sendNotification } = useNotification();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleOpenTrackingLink = async (trackingLink: string) => {
    try {
      const canOpen = await Linking.canOpenURL(trackingLink);
      if (canOpen) {
        await Linking.openURL(trackingLink);
      } else {
        Alert.alert('Error', 'Cannot open tracking link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open tracking link');
    }
  };

  const handleOrderReceived = async (order: Order) => {
    if (processingOrderId) return;

    Alert.alert(
      'Confirm Order Receipt',
      'Have you received this order? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setProcessingOrderId(order.id);
            try {
              await updateDoc(doc(db, 'orders', order.id), {
                status: 'delivered',
                orderReceivedAt: serverTimestamp(),
              });

              await sendNotification(
                order.sellerId,
                'seller',
                'Order Delivered',
                `Your order #${order.id.slice(-8).toUpperCase()} has been received by the customer.`,
                order.id
              );

              Alert.alert('Success', 'Order marked as received!');
            } catch (error) {
              console.error('Error marking order as received:', error);
              Alert.alert('Error', 'Failed to mark order as received');
            } finally {
              setProcessingOrderId(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ec4899" />
          <Text className="mt-4 text-gray-600 text-base">Loading orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View
        className="bg-white"
        style={{
          paddingTop: Platform.OS === 'ios' ? 20 : 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <View className="px-5 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 w-10 h-10 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#374151" strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">To Receive</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} on the way
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ec4899']}
            tintColor="#ec4899"
          />
        }
      >
        {orders.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20 px-6">
            <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Package size={48} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              No Orders To Receive
            </Text>
            <Text className="text-gray-500 text-center">
              Orders that are on the way will appear here
            </Text>
          </View>
        ) : (
          <View className="px-4 py-4">
            {orders.map((order) => (
              <View
                key={order.id}
                className="bg-white rounded-2xl border border-pink-100 mb-4 overflow-hidden"
                style={{
                  shadowColor: '#ec4899',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {/* Order Header */}
                <View className="px-5 py-4 border-b border-gray-100">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-gray-500 mb-1">
                        {order.shopName}
                      </Text>
                      <Text className="text-base font-bold text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </Text>
                    </View>
                    <View className="bg-pink-100 px-3 py-1.5 rounded-full flex-row items-center">
                      <Truck size={14} color="#ec4899" strokeWidth={2.5} />
                      <Text className="text-xs font-bold text-pink-600 ml-1 tracking-wide">
                        IN TRANSIT
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Calendar size={12} color="#6b7280" strokeWidth={2} />
                    <Text className="text-xs text-gray-500 ml-1">
                      Shipped on {formatDate(order.shippedAt || order.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Order Items */}
                <View className="px-5 py-4 border-b border-gray-100">
                  {order.items.map((item, index) => (
                    <View
                      key={index}
                      className={`flex-row items-center ${
                        index < order.items.length - 1
                          ? 'mb-4 pb-4 border-b border-gray-100'
                          : ''
                      }`}
                    >
                      <Image
                        source={{ uri: item.image }}
                        className="w-20 h-20 rounded-xl bg-gray-100 border border-pink-100"
                        resizeMode="cover"
                      />
                      <View className="flex-1 ml-3">
                        <Text
                          className="text-sm font-bold text-gray-900 mb-1"
                          numberOfLines={2}
                        >
                          {item.productName}
                        </Text>
                        {item.variantText && (
                          <Text className="text-xs text-gray-500 mb-2">
                            {item.variantText}
                          </Text>
                        )}
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-gray-600 bg-pink-50 px-2 py-1 rounded-full border border-pink-100">
                            x{item.quantity}
                          </Text>
                          <Text className="text-base font-bold text-pink-600">
                            ₱{item.price.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <View className="px-5 py-4 border-b border-gray-100">
                    <View className="flex-row items-start">
                      <View className="w-8 h-8 rounded-full bg-pink-100 items-center justify-center mr-3">
                        <MapPin size={16} color="#ec4899" strokeWidth={2} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-gray-500 mb-2">
                          DELIVERY ADDRESS
                        </Text>
                        <Text className="text-sm font-bold text-gray-900 mb-1">
                          {order.shippingAddress.fullName}
                        </Text>
                        <Text className="text-sm text-gray-600 leading-5">
                          {order.shippingAddress.streetAddress},{' '}
                          {order.shippingAddress.barangay},{'\n'}
                          {order.shippingAddress.city},{' '}
                          {order.shippingAddress.province}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Order Total */}
                <View className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-600">Total Payment</Text>
                    <Text className="text-xl font-bold text-pink-600">
                      ₱{order.totalPayment.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Tracking & Action */}
                <View className="px-5 py-4">
                  {/* Tracking Link */}
                  {order.shippingLink && (
                    <TouchableOpacity
                      onPress={() => handleOpenTrackingLink(order.shippingLink!)}
                      className="bg-pink-50 px-4 py-3 rounded-xl border border-pink-100 mb-3 flex-row items-center justify-between"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-8 h-8 rounded-full bg-pink-500 items-center justify-center mr-3">
                          <Truck size={16} color="white" strokeWidth={2.5} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs font-bold text-pink-900 mb-1">
                            TRACK YOUR ORDER
                          </Text>
                          <Text
                            className="text-xs text-pink-700"
                            numberOfLines={1}
                          >
                            {order.shippingLink}
                          </Text>
                        </View>
                      </View>
                      <ExternalLink size={16} color="#ec4899" strokeWidth={2.5} />
                    </TouchableOpacity>
                  )}

                  {/* Order Received Button */}
                  <TouchableOpacity
                    onPress={() => handleOrderReceived(order)}
                    disabled={processingOrderId === order.id}
                    className={`py-4 rounded-xl flex-row items-center justify-center ${
                      processingOrderId === order.id
                        ? 'bg-gray-300'
                        : 'bg-pink-500'
                    }`}
                    activeOpacity={0.8}
                    style={{
                      shadowColor:
                        processingOrderId === order.id ? 'transparent' : '#ec4899',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    {processingOrderId === order.id ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <PackageCheck size={18} color="white" strokeWidth={2.5} />
                        <Text className="text-white text-center font-bold text-base ml-2">
                          Order Received
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ToReceiveScreen;