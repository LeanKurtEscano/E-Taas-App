import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';

interface UserData {
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

  return { user, userData, loading, error };
};
