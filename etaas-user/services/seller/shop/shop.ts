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



const updateSellerInfo = async (
  userId: string,
  updates: {
    shopName?: string;
    businessName?: string;
    addressLocation?: string;
    contactNumber?: string;
    email?: string;
    description?: string;
    coverPhotoUrl?: string;
    profilePhotoUrl?: string;
  }
) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Build the update object with nested sellerInfo fields
    const updateData: any = {};
    
    Object.keys(updates).forEach((key) => {
      updateData[`sellerInfo.${key}`] = updates[key as keyof typeof updates];
    });

    await updateDoc(userRef, updateData);
    
    return { success: true };
  } catch (error) {
   
    throw error;
  }
};

export { updateSellerInfo };