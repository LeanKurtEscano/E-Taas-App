// hooks/useInbox.ts
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { UserData } from '../useCurrentUser';
import { useCurrentUser } from '../useCurrentUser';
export interface ConversationPreview {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: Timestamp;
  otherParticipant?: UserData;
  unreadCount?: number;
}

export const useInbox = () => {
  const {userData} = useCurrentUser();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userData.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const fetchedConversations: ConversationPreview[] = [];

          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            const conversationId = docSnapshot.id;

            // Get the other participant's ID
            const otherParticipantId = data.participants.find(
              (id: string) => id !== userData?.uid
            );

            // Fetch other participant's data
            let otherParticipantData: UserData | undefined;
            if (otherParticipantId) {
              const userDocRef = doc(db, 'users', otherParticipantId);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                otherParticipantData = {
                  uid: userDoc.id,
                  ...userDoc.data(),
                } as UserData;
              }
            }

            fetchedConversations.push({
              id: conversationId,
              participants: data.participants,
              lastMessage: data.lastMessage || '',
              lastMessageAt: data.lastMessageAt,
              otherParticipant: otherParticipantData,
              unreadCount: data[`unreadCount_${userData?.uid}`] || 0,
            });
          }

          setConversations(fetchedConversations);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching conversations:', err);
          setError('Failed to load conversations');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error in snapshot listener:', err);
        setError('Failed to load conversations');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.uid]);

  return { conversations, loading, error };
};
