
import { Timestamp } from "firebase/firestore";
export const formatDate = (timestamp?: Timestamp): string => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate?.() || new Date(timestamp as any);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
