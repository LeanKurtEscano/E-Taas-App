import { doc, updateDoc } from 'firebase/firestore';
import { db
 } from '@/config/firebaseConfig';

import { UserData } from '@/types/seller/shop';
export const switchToRole = async (
  userData : UserData | null,
  router: any,
  setSwitching : (switching: boolean) => void,
  route: string,
  isSeller: boolean
) => {
  try {
    setSwitching(true);

    if (userData?.uid) {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        isSeller: isSeller,
        updatedAt: new Date(),
      });

      router.replace(route);
    }
  } catch (error) {
    console.error('Error switching mode:', error);
  } finally {
    setSwitching(false);
  }
};
