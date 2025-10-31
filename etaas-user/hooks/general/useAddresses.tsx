import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/config/firebaseConfig';
import { Alert } from 'react-native';
import { Address } from '@/types/user/address';
import { updateDoc,arrayRemove } from 'firebase/firestore';
import { router } from 'expo-router';
export const useAddresses = (userData: any) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) return;

    const userRef = doc(db, 'users', userData.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const addressList = data.addressesList || [];
          setAddresses(addressList);

          // Automatically select the default address if it exists
          const defaultAddress = addressList.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedId(defaultAddress.id);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching addresses:', error);
        Alert.alert('Error', 'Failed to load addresses');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData]);



   const handleSelectAddress = async (addressId: string) => {
          try {
              if (!userData) return;
  
          
              const updatedAddresses = addresses.map(addr => ({
                  ...addr,
                  isDefault: addr.id === addressId,
                  updatedAt: new Date().toISOString()
              }));
  
              const userRef = doc(db, 'users', userData.uid);
              await updateDoc(userRef, {
                  addressesList: updatedAddresses
              });
  
              setAddresses(updatedAddresses);
              setSelectedId(addressId);
              
              Alert.alert('Success', 'Default address updated', [
                  { text: 'OK', onPress: () => router.back() }
              ]);
          } catch (error) {
              console.error('Error updating default address:', error);
              Alert.alert('Error', 'Failed to update default address');
          }
      };
  
      const handleDeleteAddress = async (addressToDelete: Address) => {
          try {
              if (!userData) return;
  
              const userRef = doc(db, 'users', userData.uid);
              
           
              await updateDoc(userRef, {
                  addressesList: arrayRemove(addressToDelete)
              });
  
            
              const updatedAddresses = addresses.filter(addr => addr.id !== addressToDelete.id);
              setAddresses(updatedAddresses);
  
             
              if (selectedId === addressToDelete.id) {
                  setSelectedId(null);
              }
  
              Alert.alert('Success', 'Address deleted successfully');
          } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
          }
      };

  return { addresses, selectedId, loading, setSelectedId ,handleDeleteAddress, handleSelectAddress};
};
