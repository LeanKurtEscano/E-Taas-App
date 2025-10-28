import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

export const listenToCartDataLength = (
  userId: string,
  callback: (count: number) => void
) => {
  const cartRef = doc(db, "carts", userId);

  const unsubscribe = onSnapshot(cartRef, (snapshot) => {
    if (snapshot.exists()) {
      const cartData = snapshot.data();
      const items = cartData.items || [];

      callback(items.length);
    } else {
      callback(0);
    }
  });

  return unsubscribe;
};