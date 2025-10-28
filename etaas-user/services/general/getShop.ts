import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { UserData } from "@/types/seller/shop";

export const fetchShopBySellerId = async (sellerId: string) => {
  try {
    const sellerRef = doc(db, "users", sellerId); 
    const sellerSnap = await getDoc(sellerRef);

       if (sellerSnap.exists()) {
        console.log("Seller data:", sellerSnap.data());
      return { id: sellerSnap.id, ...(sellerSnap.data() as UserData) };
    } else {
      console.log("No such seller found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching shop:", error);
    throw error;
  }
};