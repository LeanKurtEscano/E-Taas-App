import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';
import { listenToCartDataLength } from '@/services/user/cart/cart';

export interface UserData {
  uid: string;
  email: string;
  username: string;
  [key: string]: any;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartLength, setCartLength] = useState(0);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        setUser(firebaseUser);

        const userRef = doc(db, 'users', firebaseUser.uid);

        const unsubscribeDoc = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUserData({ uid: firebaseUser.uid, ...docSnap.data() } as UserData);
            } else {
              console.warn('User document not found');
              setUserData(null);
            }
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );

        return unsubscribeDoc;
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;

    const unsubscribe = listenToCartDataLength(userData.uid, (count) => {
      setCartLength(count);
    });

    return () => unsubscribe();
  }, [userData]);

 
  useEffect(() => {
    if (!userData?.uid) {
      setTotalUnreadCount(0);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userData.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          const unreadCount = data[`unreadCount_${userData.uid}`] || 0;
          total += unreadCount;
        });
        setTotalUnreadCount(total);
      },
      (err) => {
        console.error('Error listening to unread counts:', err);
      }
    );

    return () => unsubscribe();
  }, [userData?.uid]);

  return { user, userData, loading, error, cartLength, totalUnreadCount };
};