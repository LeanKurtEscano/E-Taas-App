// hooks/useShopData.ts
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { ShopData } from '@/types/seller/shop';
import { Product } from '@/types/product/product';
import { UserData } from '../useCurrentUser';

export const useShopData = (sellerId: string | string[]) => {
  const [shopInfo, setShopInfo] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [fullSellerData, setFullSellerData] = useState<UserData | null>(null);
  useEffect(() => {
    if (!sellerId || Array.isArray(sellerId)) {
      setLoading(false);
      return;
    }

    const fetchShopInfo = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', sellerId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setShopInfo(userData.sellerInfo as ShopData);
          setFullSellerData(userData as UserData);
        } else {
          setError('Shop not found');
        }
      } catch (err) {
       
        setError('Failed to load shop information');
      }
    };

    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsList: Product[] = [];
        snapshot.forEach((doc) => {
          productsList.push({
            id: doc.id,
            ...doc.data(),
          } as Product);
        });
        setProducts(productsList);
        setLoading(false);
      },
      (err) => {
      
        setError('Failed to load products');
        setLoading(false);
      }
    );

    fetchShopInfo();

    return () => unsubscribe();
  }, [sellerId]);

  return { shopInfo, products, loading, error,setFullSellerData, fullSellerData  };
};