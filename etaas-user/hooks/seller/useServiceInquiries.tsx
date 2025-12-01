

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  deleteDoc, 
  doc,
  getDoc 
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import useToast from '@/hooks/general/useToast';

interface Inquiry {
  id: string;
  serviceId: string;
  serviceName: string;
  businessName: string;
  serviceOwnerId: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Service {
  serviceName: string;
  businessName: string;
}

export const useServiceInquiries = (serviceId: string) => {
  const { userData } = useCurrentUser();
  const { toastVisible, toastMessage, toastType, showToast, setToastVisible } = useToast();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  const fetchData = async () => {
    try {
      // Fetch service details
      const serviceDoc = await getDoc(doc(db, 'services', serviceId));
      if (serviceDoc.exists()) {
        const serviceData = serviceDoc.data();
        setService({
          serviceName: serviceData.serviceName,
          businessName: serviceData.businessName,
        });

       
      } else {
        showToast('Service not found', 'error');
        return null;
      }

      
      const inquiriesRef = collection(db, 'inquiries');
      const q = query(
        inquiriesRef,
        where('serviceId', '==', serviceId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const inquiriesData: Inquiry[] = [];
      
      querySnapshot.forEach((doc) => {
        inquiriesData.push({
          id: doc.id,
          ...doc.data(),
        } as Inquiry);
      });

      setInquiries(inquiriesData);
    } catch (error) {
     
      showToast('Failed to load inquiries', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const deleteInquiry = async (inquiryId: string): Promise<boolean> => {
    setDeleting(inquiryId);
    try {
      await deleteDoc(doc(db, 'inquiries', inquiryId));
      setInquiries((prev) => prev.filter((inquiry) => inquiry.id !== inquiryId));
      showToast('Inquiry deleted successfully', 'success');
      return true;
    } catch (error) {
     
      showToast('Failed to delete inquiry', 'error');
      return false;
    } finally {
      setDeleting(null);
    }
  };

  const isOwner = service ? true : false;

  return {
    inquiries,
    service,
    loading,
    refreshing,
    deleting,
    isOwner,
    toastVisible,
    toastMessage,
    toastType,
    setToastVisible,
    onRefresh,
    deleteInquiry,
  };
};