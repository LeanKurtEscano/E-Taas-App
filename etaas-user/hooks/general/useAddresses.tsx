import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/config/firebaseConfig';
import { Alert } from 'react-native';
import { Address } from '@/types/user/address';
import { updateDoc,arrayRemove } from 'firebase/firestore';
import { router } from 'expo-router';
import useToast from './useToast';
export const useAddresses = (userData: any) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toastVisible, toastMessage, toastType, showToast, setToastVisible } = useToast();
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
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
       
        showToast('Failed to load addresses', 'error');
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
              
              showToast('Default address updated successfully', 'success');
          } catch (error) {
        
              showToast('Failed to update default address', 'error');
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

              setAddressToDelete(null);
              setIsDeleteModalOpen(false);
  
              showToast('Address deleted successfully', 'success');
          } catch (error) {
              
              showToast('Failed to delete address', 'error');
          }
      };

  return { addresses, selectedId, loading, setSelectedId ,handleDeleteAddress, handleSelectAddress, toastVisible, toastMessage, toastType, 
    setToastVisible, isDeleteModalOpen, 
    setIsDeleteModalOpen, setAddressToDelete, addressToDelete };
};
