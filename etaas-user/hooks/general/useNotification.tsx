import { doc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

import generateRandomId from '@/utils/general/generateId';

export const useNotification = () => {

  const sendNotification = async (
    userId: string,
    type: 'buyer' | 'seller',
    title: string,
    message: string,
    orderId?: string,
    directId?: string
  ) => {
    try {
      const notifRef = doc(db, 'notifications', userId);
      
      const notification = {
        id: generateRandomId(),
        type,
        title,
        message,
        orderId: orderId || null,
        status: 'unread',
        createdAt: new Date().toISOString(),
        directId: directId || null,
      };

      await setDoc(
        notifRef,
        { notifications: arrayUnion(notification) },
        { merge: true }
      );

      console.log(`✅ Notification sent to user ${userId}`);
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      throw error;
    }
  };

  return { sendNotification };
};
 