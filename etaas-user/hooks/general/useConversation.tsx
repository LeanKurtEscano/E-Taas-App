import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
  createdAt: Timestamp;
}

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const useConversation = (currentUserId: string, sellerId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Create consistent conversation ID (alphabetically sorted)
  const conversationId = [currentUserId, sellerId].sort().join('_');

  useEffect(() => {
    if (!currentUserId || !sellerId) return;

    const messagesRef = collection(
      db,
      'conversations',
      conversationId,
      'messages'
    );
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedMessages: Message[] = [];
        snapshot.forEach((doc) => {
          fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(fetchedMessages);
        setLoading(false);
      },
      (error) => {
       
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUserId, sellerId, conversationId]);

 useEffect(() => {
  if (!currentUserId || !sellerId) return;

  const markAsRead = async () => {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (conversationSnap.exists()) {
        await updateDoc(conversationRef, {
          [`unreadCount_${currentUserId}`]: 0,
        });
      } 
      
    } catch (error) {
      
    }
  };

  markAsRead();
}, [currentUserId, sellerId]);


  const uploadToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
      // Create form data
      const formData = new FormData();

      // Get file extension
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `chat_${Date.now()}.${fileExtension}`;

      // Append image file
      formData.append('file', {
        uri: imageUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);

      formData.append('upload_preset', uploadPreset || '');
      formData.append('folder', 'conversations');

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
   
      throw error;
    }
  };

  const sendMessage = async (text?: string, imageUri?: string) => {
    if ((!text?.trim() && !imageUri) || sendingMessage) return;

    setSendingMessage(true);
    try {
      let cloudinaryUrl = '';

      // Upload image to Cloudinary only if imageUri is provided
      if (imageUri) {
        cloudinaryUrl = await uploadToCloudinary(imageUri) || '';
      }

      const messagesRef = collection(
        db,
        'conversations',
        conversationId,
        'messages'
      );

      const messageData = {
        senderId: currentUserId,
        receiverId: sellerId,
        text: text?.trim() || '',
        imageUrl: cloudinaryUrl,
        isRead: false,
        createdAt: Timestamp.now(),
      };

      await addDoc(messagesRef, messageData);

      // Update conversation metadata at the root level
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
          participants: [currentUserId, sellerId],
          lastMessage: text?.trim() || 'Sent an image',
          lastMessageSender: currentUserId,
          lastMessageAt: Timestamp.now(),
          // Increment receiver's unread count
          [`unreadCount_${sellerId}`]: receiverUnreadCount,
          // Reset sender's unread count to 0
          [`unreadCount_${currentUserId}`]: 0,
        },
        { merge: true }
      );
    } catch (error) {
    
      throw error;
    } finally {
      setSendingMessage(false);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    try {
      setUploadingImage(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload images.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      
      alert('Failed to pick image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  return {
    messages,
    loading,
    sendingMessage,
    uploadingImage,
    sendMessage,
    uploadImage,
  };
};