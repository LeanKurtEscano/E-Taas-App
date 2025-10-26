// firebaseService.ts
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Product, ShopData } from '@/types/seller/shop';



export const fetchProductData = async (productId: string) => { 
  const productRef = doc(db, "products", productId);
  const productSnap = await getDoc(productRef);

  if (productSnap.exists()) {
    return {
      id: productSnap.id,      
      ...productSnap.data(),   
    } as Product & { id: string };
  } else {
    throw new Error("Product not found");
  }
};