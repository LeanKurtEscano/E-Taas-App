import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Order } from '@/types/order/sellerOrder';

export const useToShipOrders = () => {
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
      where('status', 'in', ['confirmed', 'shipped'])
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
          // Show all shipped orders
          if (order.status === 'shipped') {
            return true;
          }

          // For confirmed orders, only show if within last 5 days
          if (order.status === 'confirmed' && order.confirmedAt) {
            const confirmedDate = order.confirmedAt.toDate();
            return confirmedDate >= fiveDaysAgo;
          }

          return false;
        })
        .sort((a, b) => {
          // Sort by most recent first
          const dateA = a.confirmedAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
          const dateB = b.confirmedAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
          return dateB - dateA;
        });

      setOrders(filteredOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  return { orders, loading };
};