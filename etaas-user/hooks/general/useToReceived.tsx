import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Order } from '@/types/order/sellerOrder';

export const useToReceiveOrders = () => {
  const { userData } = useCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userData.uid),
      where('status', '==', 'shipped')
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

      const filteredOrders = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Order))
        .filter((order) => {
          // If order has orderReceivedAt, exclude if older than 5 days
          if (order.orderReceivedAt) {
            const receivedDate = order.orderReceivedAt.toDate();
            return receivedDate >= fiveDaysAgo;
          }
          
          // Show all shipped orders without orderReceivedAt
          return true;
        })
        .sort((a, b) => {
          // Sort by most recent shipped first
          const dateA = a.shippedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
          const dateB = b.shippedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });

      setOrders(filteredOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  return { orders, loading };
};