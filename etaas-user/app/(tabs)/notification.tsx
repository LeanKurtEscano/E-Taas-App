import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebaseConfig'
import Feather from '@expo/vector-icons/Feather'
import { router } from 'expo-router'
import { formatNotificationTime } from '@/utils/general/formatDate'
interface Notification {
  createdAt: string
  id: string
  message: string
  orderId: string
  status: 'unread' | 'read'
  title: string
  directId?: string
  type: 'seller' | 'buyer'
}

const NotificationScreen = () => {
  const { userData } = useCurrentUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false)

  useEffect(() => {
    if (!userData?.uid) return

    const notificationRef = doc(db, 'notifications', userData.uid)

    const unsubscribe = onSnapshot(
      notificationRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          const notifs = data.notifications || []


          const sortedNotifs = notifs.sort((a: Notification, b: Notification) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )

          setNotifications(sortedNotifs)
          setLoading(false)
          setRefreshing(false)

          // Mark all as read after 1.5 seconds delay (only once per mount)
          if (!hasMarkedAsRead) {
            const hasUnread = notifs.some((n: Notification) => n.status === 'unread')
            if (hasUnread) {
              setTimeout(async () => {
                const updatedNotifs = notifs.map((n: Notification) => ({
                  ...n,
                  status: 'read'
                }))

                await updateDoc(notificationRef, {
                  notifications: updatedNotifs
                })
                setHasMarkedAsRead(true)
              }, 1500)
            } else {
              setHasMarkedAsRead(true)
            }
          }
        } else {
          setNotifications([])
          setLoading(false)
          setRefreshing(false)
        }
      },
      (error) => {
        console.error('Error fetching notifications:', error)
        setLoading(false)
        setRefreshing(false)
      }
    )

    return () => unsubscribe()
  }, [userData?.uid, hasMarkedAsRead])

  const onRefresh = () => {
    setRefreshing(true)
  }



  const handleNotificationPress = (notification: Notification) => {
    const title = notification.title.toLowerCase();

    const routeMap: { [key: string]: string } = {
      shipped: '/orders/toship',
      confirmed: '/orders/toship',
      'variant': `/products`,
      'out of stock': `/seller/product/?productId=${notification.directId}`,
      'inquiry': `/seller/inquiries/${notification.directId}`,
      'placed successfully': '/orders/order',
      'order received': '/seller/orders',
      'order delivered': '/seller/orders',
      cancelled: '/seller/orders',
    };

    for (const key in routeMap) {
      if (title.includes(key)) {
        router.push(routeMap[key]);
        return;
      }
    }

    console.warn('No matching route for notification:', notification.title);
  };


  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Feather name="bell" size={48} color="#ec4899" />
        <Text className="text-gray-400 mt-4">Loading notifications...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ec4899"
            colors={['#ec4899']}
          />
        }
      >
        {/* Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-100">
          <Text className="text-3xl font-bold text-gray-800">Notifications</Text>
          <Text className="text-gray-500 mt-1">
            {notifications.length === 0
              ? 'No notifications yet'
              : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`
            }
          </Text>
        </View>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-pink-50 rounded-full p-6 mb-4">
              <Feather name="bell-off" size={48} color="#ec4899" />
            </View>
            <Text className="text-xl font-semibold text-gray-800 mb-2">
              No notifications yet
            </Text>
            <Text className="text-gray-500 text-center px-8">
              When you get notifications, they'll show up here
            </Text>
          </View>
        ) : (
          <View className="px-4 py-2">
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className={`rounded-2xl p-4 mb-3 shadow-sm border ${notification.status === 'unread'
                    ? 'bg-pink-50 border-pink-200'
                    : 'bg-white border-gray-100'
                  }`}
                activeOpacity={0.7}
              >
                <View className="flex-row">
                  {/* Unread Indicator Dot */}
                  {notification.status === 'unread' && (
                    <View className="absolute -left-1 top-1">
                      <View className="w-3 h-3 bg-pink-500 rounded-full" />
                    </View>
                  )}

                  {/* Icon */}
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${notification.type === 'seller' ? 'bg-pink-100' : 'bg-blue-100'
                    }`}>
                    <Feather
                      name={notification.type === 'seller' ? 'shopping-bag' : 'check-circle'}
                      size={24}
                      color={notification.type === 'seller' ? '#ec4899' : '#3b82f6'}
                    />
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <View className="flex-row items-center flex-1 pr-2">
                        <Text className={`text-base font-bold flex-1 ${notification.status === 'unread' ? 'text-gray-900' : 'text-gray-800'
                          }`}>
                          {notification.title}
                        </Text>
                        {notification.status === 'unread' && (
                          <View className="bg-pink-500 px-2 py-0.5 rounded-full ml-2">
                            <Text className="text-white text-xs font-bold">NEW</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-gray-400">
                        {formatNotificationTime(notification.createdAt)}
                      </Text>
                    </View>

                    <Text className={`text-sm mb-3 leading-5 ${notification.status === 'unread' ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                      {notification.message}
                    </Text>

                    {/* Footer */}
                    <View className="flex-row items-center justify-between">
                      <View className={`px-3 py-1 rounded-full ${notification.type === 'seller' ? 'bg-pink-50' : 'bg-blue-50'
                        }`}>
                        <Text className={`text-xs font-semibold ${notification.type === 'seller' ? 'text-pink-600' : 'text-blue-600'
                          }`}>
                          {notification.type === 'seller' ? 'Seller' : 'Buyer'}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <Text className="text-xs text-gray-500 mr-1">{notification.title.toLowerCase().includes("out of stock")
                          ? "View Product"
                          : notification.title.toLowerCase().includes("inquiry")
                            ? "View Inquiry"
                            : "View Order"}
                        </Text>
                        <Feather name="chevron-right" size={14} color="#9ca3af" />
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom Padding */}
        <View className="h-6" />
      </ScrollView>
    </View>
  )
}

export default NotificationScreen