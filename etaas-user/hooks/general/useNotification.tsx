import { doc, setDoc, arrayUnion, serverTimestamp, Timestamp, collection, addDoc, getDoc } from 'firebase/firestore';
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

      throw error;
    }
  };


  const sendShippingMessageNotification = async (
    userId: string,
    sellerId: string,
    text: string,
    imageUri: String) => {
    if ((!text?.trim() && !imageUri)) return;

    try {



      const conversationId = [userId, sellerId].sort().join('_');

      const messagesRef = collection(
        db,
        'conversations',
        conversationId,
        'messages'
      );

      const messageData = {
        senderId: sellerId,
        receiverId: userId,
        text: text?.trim() || '',
        imageUrl: imageUri || '',
        isRead: false,
        createdAt: Timestamp.now(),
      };

      await addDoc(messagesRef, messageData);

      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);

      let receiverUnreadCount = 1;
      if (conversationSnap.exists()) {
        const convoData = conversationSnap.data();
        receiverUnreadCount = (convoData[`unreadCount_${sellerId}`] || 0) + 1;
      }

      await setDoc(
        conversationRef,
        {
          participants: [userId, sellerId],
          lastMessage: text?.trim() || 'Sent an image',
          lastMessageSender: sellerId,
          lastMessageAt: Timestamp.now(),

          [`unreadCount_${userId}`]: receiverUnreadCount,

          [`unreadCount_${sellerId}`]: 0,
        },
        { merge: true }
      );
    } catch (error) {

      throw error;
    }

  }


  const sendInquiryNotification = async (userId: string, sellerId: string, text: string) => {
    try {
      const conversationId = [userId, sellerId].sort().join('_');

      const messagesRef = collection(
        db,
        'conversations',
        conversationId,
        'messages'
      );


      const messageData = {
        senderId: userId,
        receiverId: sellerId,
        text: text?.trim() || '',
        isRead: false,
        createdAt: Timestamp.now(),
      };

      await addDoc(messagesRef, messageData);

      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);

      let receiverUnreadCount = 1;
      if (conversationSnap.exists()) {
        const convoData = conversationSnap.data();
        receiverUnreadCount = (convoData[`unreadCount_${userId}`] || 0) + 1;
      }

      await setDoc(
        conversationRef,
        {
          participants: [userId, sellerId],
          lastMessage: text?.trim() || 'Sent an image',
          lastMessageSender: sellerId,
          lastMessageAt: Timestamp.now(),

          [`unreadCount_${userId}`]: 0,

          [`unreadCount_${sellerId}`]: receiverUnreadCount,
        },
        { merge: true }
      );


    } catch (error) {
      throw error;

    }
  }

  return { sendNotification, sendShippingMessageNotification, sendInquiryNotification };
};
