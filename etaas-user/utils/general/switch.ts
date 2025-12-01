import { doc, updateDoc } from 'firebase/firestore';
import { db
 } from '@/config/firebaseConfig';

import { UserData } from '@/types/seller/shop';
export const switchToRole = async (
  userData : UserData | null,
  setSwitching : (switching: boolean) => void,
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
    }
  } catch (error) {
   
  } finally {
    setSwitching(false);
  }
};
