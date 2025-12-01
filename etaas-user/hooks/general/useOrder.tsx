import { View, Text } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react';
import { Order } from '@/types/order/userOrder';
import { db } from '@/config/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useCurrentUser } from '../useCurrentUser';
import { useNotification } from './useNotification';
import useToast from './useToast';


const useOrder = () => {
 const [orders, setOrders] = useState<Order[]>([]);
   const { userData } = useCurrentUser();
   const { toastVisible, toastMessage, toastType, showToast, setToastMessage, setToastType, setToastVisible } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const { sendNotification } = useNotification();
  useEffect(() => {
    if (!userData) return;

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userData.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        
        setOrders(ordersData);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
      
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [userData]);

  const onRefresh = () => {
    setRefreshing(true);
  };



  const handleCancelOrder = async (orderId: string, sellerId: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: 'cancelled'
    });


    await sendNotification(
      sellerId,
      'seller',
      'Order Cancelled',
      'An order from a buyer has been cancelled.',
      orderId
    );

    setOrderToCancel(null);
    setShowCancelModal(false);

    showToast('Order cancelled successfully', 'success');
  } catch (error) {
  
    showToast('Failed to cancel order. Please try again.', 'error');
  }
};
 

  const getTabIcon = (key: string) => {
    switch (key) {
      case 'all': return 'albums-outline';
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'shipped': return 'bicycle-outline';
      case 'delivered': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedTab); 

    console.log('Filtered Orders:', filteredOrders);

  const tabs = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
  ];


  return { orders: filteredOrders, loading, refreshing, onRefresh, 
    selectedTab, setSelectedTab,
     tabs, getTabIcon, 
    handleCancelOrder, toastVisible, toastMessage, toastType, 
    showToast, setToastMessage, setToastType, setToastVisible , 
    showCancelModal, setShowCancelModal, orderToCancel, setOrderToCancel};
}

export default useOrder