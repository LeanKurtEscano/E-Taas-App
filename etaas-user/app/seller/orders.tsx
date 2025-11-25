import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform
} from 'react-native';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  MapPin,
  Phone,
  Link as LinkIcon,
  Calendar
} from 'lucide-react-native';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { router } from 'expo-router';
import { formatDate } from '@/utils/general/formatDate';
import { getStatusColor } from '@/utils/general/getStatus';
import { ShippingAddress, ProductVariant, ProductData, Order } from '@/types/order/sellerOrder';
import { useNotification } from '@/hooks/general/useNotification';
import { SafeAreaView } from 'react-native-safe-area-context';
const ManageOrders = () => {
  const { userData } = useCurrentUser()
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { sendShippingMessageNotification } = useNotification();
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [trackingLinks, setTrackingLinks] = useState<Record<string, string>>({});
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>('all');
  const { sendNotification } = useNotification();
  useEffect(() => {
    if (!userData?.uid) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where('sellerId', '==', userData.uid)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData: Order[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      } as Order));

      ordersData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA;
      });

      setOrders(ordersData);
      setLoading(false);

    });

    return () => unsubscribe();
  }, [userData?.uid]);

  const handleConfirmOrder = async (order: Order): Promise<void> => {
    if (processingOrderId) return;

    Alert.alert(
      'Confirm Order',
      'Are you sure you want to confirm this order? This will deduct the quantities from your inventory.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setProcessingOrderId(order.id);
            try {
              for (const item of order.items) {
                const productRef = doc(db, 'products', item.productId);
                const productSnap = await getDoc(productRef);

                if (!productSnap.exists()) {
                  throw new Error(`Product ${item.productName} not found`);
                }

                const productData = productSnap.data() as ProductData;




                if (productData.hasVariants) {
                  const variants = productData.variants || [];

                  const variantIndex = variants.findIndex((v: ProductVariant) => v.id === item.variantId);

                  if (variantIndex === -1) {
                    throw new Error(`Variant not found for ${item.productName}`);
                  }

                  const currentQuantity = variants[variantIndex].stock || 0;

                  if (currentQuantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.productName} - ${item.variantText}`);
                  }

                  const newQuantity = currentQuantity - item.quantity;
                  const isOutOfStock = newQuantity <= 0;
                  const isProductLowOnStock = newQuantity <= 10 && newQuantity > 0;

                  if (isOutOfStock) {
                    variants[variantIndex].stock = newQuantity;
                    await updateDoc(productRef, { variants });

                    await sendNotification(
                      userData!.uid,
                      'seller',
                      'Product Variant Out of Stock',
                      `Your product "${item.productName}" variant "${item.variantText}" is now out of stock after confirming an order.`,
                      undefined,
                      item.productId
                    );


                  } else if (isProductLowOnStock) {

                    await sendNotification(
                      userData!.uid,
                      'seller',
                      'Product Variant Low on Stock',
                      `Your product "${item.productName}" variant "${item.variantText}" is low on stock after confirming an order.`,
                      undefined,
                      item.productId
                    );

                    variants[variantIndex].stock = newQuantity;
                    await updateDoc(productRef, { variants });
                  } else {
                    variants[variantIndex].stock = newQuantity;
                    await updateDoc(productRef, { variants });

                  }






                } else {

                  const currentQuantity = productData.quantity || 0;
                  if (currentQuantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.productName}`);
                  }
                  const newQuantity = currentQuantity - item.quantity;
                  const isOutOfStock = newQuantity <= 0;
                  const isProductLowOnStock = newQuantity <= 10 && newQuantity > 0;

                  if (isOutOfStock) {
                    await updateDoc(productRef, {
                      quantity: newQuantity,
                      availability: "out of stock"
                    });

                    await sendNotification(
                      userData!.uid,
                      'seller',
                      'Product Out of Stock',
                      `Your product "${item.productName}" is now out of stock after confirming an order.`,
                      undefined,
                      item.productId
                    );

                  } else if (isProductLowOnStock) {
                    await sendNotification(
                      userData!.uid,
                      'seller',
                      'Product Low on Stock',
                      `Your product "${item.productName}" is low on stock after confirming an order.`,
                      undefined,
                      item.productId
                    );
                    await updateDoc(productRef, {
                      quantity: newQuantity
                    });
                  } else {
                    await updateDoc(productRef, {
                      quantity: newQuantity
                    });
                  }


                }
              }

              await updateDoc(doc(db, 'orders', order.id), {
                status: 'confirmed',
                confirmedAt: serverTimestamp()
              });

              await sendNotification(
                order.userId,
                'buyer',
                'Order Confirmed',
                `Your order from ${order.shopName} has been confirmed and is being prepared for shipment.`,
                order.id
              );
              Alert.alert('Success', 'Order confirmed successfully!');
            } catch (error) {
              
              const errorMessage = error instanceof Error ? error.message : 'Failed to confirm order';
              Alert.alert('Error', errorMessage);
            } finally {
              setProcessingOrderId(null);
            }
          }
        }
      ]
    );
  };

  const handleAddTracking = async (order: Order): Promise<void> => {
    const trackingLink = trackingLinks[order.id];

    if (!trackingLink || !trackingLink.trim()) {
      Alert.alert('Error', 'Please enter a tracking link');
      return;
    }

    if (processingOrderId) return;
    setProcessingOrderId(order.id);

    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'shipped',
        shippingLink: trackingLink.trim(),
        shippedAt: serverTimestamp()
      });


      for (const item of order.items) {
        await sendShippingMessageNotification(
          order.userId,
          order.sellerId,
          `Your item "${item.productName}" is being packed and is almost ready to ship! 🚚
Track its progress here: ${trackingLink.trim()}`,
          item.image
        );

      }


      await sendNotification(
        order.userId,
        'buyer',
        'Order Shipped',
        `Your order has been shipped! Track here: ${trackingLink.trim()}`,
        order.id
      );
      setTrackingLinks(prev => ({ ...prev, [order.id]: '' }));
      Alert.alert('Success', 'Tracking link added and buyer notified!');
    } catch (error) {
      console.error('Error adding tracking:', error);
      Alert.alert('Error', 'Failed to add tracking link');
    } finally {
      setProcessingOrderId(null);
    }
  };



  const getStatusIcon = (status: Order['status']) => {
    const iconProps = { size: 14, strokeWidth: 2.5 };
    switch (status) {
      case 'pending': return <Clock {...iconProps} color="#92400e" />;
      case 'confirmed': return <CheckCircle {...iconProps} color="#1e40af" />;
      case 'shipped': return <Truck {...iconProps} color="#6b21a8" />;
      case 'delivered': return <PackageCheck {...iconProps} color="#166534" />;
      case 'cancelled': return <XCircle {...iconProps} color="#4b5563" />;
      default: return <Package {...iconProps} color="#4b5563" />;
    }
  };

  const filteredOrders = selectedTab === 'all'
    ? orders
    : orders.filter(order => order.status === selectedTab);

  const getOrderCount = (status: string) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
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

      <View className="bg-white" style={{
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3
      }}>
        <View className="px-5 pb-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              className="mr-4 w-10 h-10 rounded-fullitems-center justify-center"
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#374151" strokeWidth={2.5} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">Orders</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                Manage your shop orders
              </Text>
            </View>
          </View>

          {/* Status Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row -mx-1"
          >
            {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab as any)}
                className={`px-4 py-2.5 rounded-full mx-1 ${selectedTab === tab
                  ? 'bg-pink-500'
                  : 'bg-gray-100'
                  }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className={`text-sm font-semibold capitalize ${selectedTab === tab ? 'text-white' : 'text-gray-700'
                    }`}>
                    {tab}
                  </Text>
                  {getOrderCount(tab) > 0 && (
                    <View className={`ml-2 px-2 py-0.5 rounded-full ${selectedTab === tab ? 'bg-white/20' : 'bg-pink-100'
                      }`}>
                      <Text className={`text-xs font-bold ${selectedTab === tab ? 'text-white' : 'text-pink-600'
                        }`}>
                        {getOrderCount(tab)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}

      >
        {filteredOrders.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20 px-6">
            <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Package size={48} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">No Orders Found</Text>
            <Text className="text-gray-500 text-center">
              {selectedTab === 'all'
                ? 'Orders will appear here once customers place them'
                : `No ${selectedTab} orders at the moment`}
            </Text>
          </View>
        ) : (
          <View className="px-4 py-4">
            {filteredOrders.map((order) => (
              <View
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 4
                }}
              >
                {/* Order Header - Modern Design */}
                <View className="px-5 py-4 border-b border-gray-100">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-xs font-semibold text-gray-500 mb-1">
                        ORDER ID
                      </Text>
                      <Text className="text-base font-bold text-gray-900">
                        #{order.id.slice(-8).toUpperCase()}
                      </Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-full ${getStatusColor(order.status)} flex-row items-center`}>
                      {getStatusIcon(order.status)}
                      <Text className="text-xs font-bold uppercase tracking-wide ml-1">
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Calendar size={12} color="#6b7280" strokeWidth={2} />
                    <Text className="text-xs text-gray-500 ml-1">
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Shipping Address - Cleaner Layout */}
                {order.shippingAddress && (
                  <View className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                    <Text className="text-xs font-bold text-gray-500 mb-3 tracking-wide">
                      DELIVERY ADDRESS
                    </Text>
                    <View className="flex-row items-start">
                      <View className="w-8 h-8 rounded-full bg-pink-100 items-center justify-center mr-3">
                        <MapPin size={16} color="#ec4899" strokeWidth={2} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900 mb-1">
                          {order.shippingAddress.fullName}
                        </Text>
                        <View className="flex-row items-center mb-1">
                          <Phone size={12} color="#4b5563" strokeWidth={2} />
                          <Text className="text-sm text-gray-600 ml-1">
                            {order.shippingAddress.phoneNumber}
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-600 leading-5">
                          {order.shippingAddress.streetAddress}, {order.shippingAddress.barangay},{'\n'}
                          {order.shippingAddress.city}, {order.shippingAddress.province}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Order Items - Enhanced Design */}
                <View className="px-5 py-4 border-b border-gray-100">
                  <Text className="text-xs font-bold text-gray-500 mb-3 tracking-wide">
                    ITEMS ({order.items.length})
                  </Text>
                  {order.items.map((item, index) => (
                    <View
                      key={index}
                      className={`flex-row items-center ${index < order.items.length - 1 ? 'mb-4 pb-4 border-b border-gray-100' : ''
                        }`}
                    >
                      <Image
                        source={{ uri: item.image }}
                        className="w-20 h-20 rounded-xl bg-gray-100"
                        resizeMode="cover"
                      />
                      <View className="flex-1 ml-3">
                        <Text className="text-sm font-bold text-gray-900 mb-1" numberOfLines={2}>
                          {item.productName}
                        </Text>
                        {item.variantText && (
                          <Text className="text-xs text-gray-500 mb-2">
                            {item.variantText}
                          </Text>
                        )}
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
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

                {/* Order Summary - Modern Layout */}
                <View className="px-5 py-4 bg-gray-50">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">Subtotal</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      ₱{order.totalAmount.toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm text-gray-600">Shipping Fee</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      ₱{order.shippingFee.toLocaleString()}
                    </Text>
                  </View>
                  <View className="h-px bg-gray-200 my-2" />
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-base font-bold text-gray-900">Total Payment</Text>
                    <Text className="text-xl font-bold text-pink-600">
                      ₱{order.totalPayment.toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-2">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    <Text className="text-xs text-gray-600">
                      Payment: <Text className="font-bold capitalize text-green-600">{order.paymentStatus}</Text>
                    </Text>
                  </View>
                </View>

                {/* Action Section - Enhanced Buttons */}
                <View className="px-5 py-4">
                  {order.status === 'pending' && (
                    <TouchableOpacity
                      onPress={() => handleConfirmOrder(order)}
                      disabled={processingOrderId === order.id}
                      className={`py-4 rounded-xl flex-row items-center justify-center ${processingOrderId === order.id
                        ? 'bg-gray-300'
                        : 'bg-pink-500'
                        }`}
                      activeOpacity={0.8}
                      style={{
                        shadowColor: processingOrderId === order.id ? 'transparent' : '#ec4899',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5
                      }}
                    >
                      {processingOrderId === order.id ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <CheckCircle size={18} color="white" strokeWidth={2.5} />
                          <Text className="text-white text-center font-bold text-base ml-2">
                            Confirm Order
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {order.status === 'cancelled' && (
                    <View className="py-4 rounded-xl bg-gray-200 flex-row items-center justify-center">
                      <XCircle size={18} color="#4b5563" strokeWidth={2.5} />
                      <Text className="text-gray-600 text-center font-bold text-base ml-2">
                        Order Cancelled
                      </Text>
                    </View>
                  )}

                  {order.status === 'confirmed' && (
                    <View>
                      <View className="relative">
                        <TextInput
                          value={trackingLinks[order.id] || ''}
                          onChangeText={(text: string) =>
                            setTrackingLinks(prev => ({ ...prev, [order.id]: text }))
                          }
                          placeholder="Enter Lalamove tracking link"
                          placeholderTextColor="#9ca3af"
                          className="border-2 border-gray-200 rounded-xl px-4 py-3.5 pl-10 mb-3 text-sm text-gray-900 bg-white"
                          editable={processingOrderId !== order.id}
                        />
                        <View className="absolute left-3 top-3.5">
                          <LinkIcon size={18} color="#9ca3af" strokeWidth={2} />
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleAddTracking(order)}
                        disabled={processingOrderId === order.id}
                        className={`py-4 rounded-xl flex-row items-center justify-center ${processingOrderId === order.id
                          ? 'bg-gray-300'
                          : 'bg-pink-500'
                          }`}
                        activeOpacity={0.8}
                        style={{
                          shadowColor: processingOrderId === order.id ? 'transparent' : '#ec4899',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 5
                        }}
                      >
                        {processingOrderId === order.id ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <Truck size={18} color="white" strokeWidth={2.5} />
                            <Text className="text-white text-center font-bold text-base ml-2">
                              Add Tracking & Ship Order
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {order.status === 'shipped' && order.shippingLink && (
                    <View className="bg-purple-50 px-4 py-4 rounded-xl border border-purple-200">
                      <View className="flex-row items-center mb-2">
                        <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center mr-2">
                          <Truck size={16} color="white" strokeWidth={2.5} />
                        </View>
                        <Text className="text-xs font-bold text-purple-900 tracking-wide">
                          TRACKING INFORMATION
                        </Text>
                      </View>
                      <Text className="text-sm text-purple-700 font-medium" numberOfLines={2}>
                        {order.shippingLink}
                      </Text>
                    </View>
                  )}

                  {order.status === 'delivered' && (
                    <View className="bg-green-50 px-4 py-4 rounded-xl border border-green-200">
                      <View className="flex-row items-center justify-center">
                        <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                          <CheckCircle size={20} color="white" strokeWidth={2.5} />
                        </View>
                        <Text className="text-center text-green-700 font-bold text-base">
                          Order Delivered Successfully
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default ManageOrders;