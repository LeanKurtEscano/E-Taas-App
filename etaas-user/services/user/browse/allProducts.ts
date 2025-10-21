

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Product } from '@/types/seller/shop';


export const fetchAllProducts = async (): Promise<Product[]> => {
  try {
    const productsCol = collection(db, "products");
    const productSnapshot = await getDocs(productsCol);

    const productList: Product[] = productSnapshot.docs.map((doc) => ({
      id: doc.id, 
      ...doc.data(),
    })) as Product[];

    return productList;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};
