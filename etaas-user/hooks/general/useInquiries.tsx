import { useState, useEffect } from 'react';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import useToast from '@/hooks/general/useToast';
import { useNotification } from './useNotification';
interface Service {
  id: string;
  serviceName: string;
  businessName: string;
  ownerName: string;
  contactNumber: string;
  address: string;
  serviceDescription: string;
  category: string;
  priceRange?: string;
  facebookLink?: string;
  availability: boolean;
  bannerImage: string;
  images: string[];
  userId: string;
  shopId?: Number;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryData {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
}

export const useInquiries = (serviceId: string) => {
  const { userData } = useCurrentUser();
  const { toastVisible, toastMessage, toastType, showToast, setToastVisible } = useToast();
  const {sendNotification} = useNotification();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [inquiryData, setInquiryData] = useState<InquiryData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    message: '',
  });

  const {sendInquiryNotification} = useNotification();  

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      const serviceDoc = await getDoc(doc(db, 'services', serviceId));
      
      if (serviceDoc.exists()) {
        setService({
          id: serviceDoc.id,
          ...serviceDoc.data(),
        } as Service);
      } else {
        showToast('Service not found', 'error');
        return null;
      }
    } catch (error) {
    
      showToast('Failed to load service details', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const validateInquiry = (): boolean => {
    if (!inquiryData.customerName.trim()) {
      showToast('Please enter your name', 'error');
      return false;
    }
    if (!inquiryData.customerPhone.trim()) {
      showToast('Please enter your phone number', 'error');
      return false;
    }
    if (!inquiryData.message.trim()) {
      showToast('Please enter your inquiry message', 'error');
      return false;
    }
    return true;
  };

  const submitInquiry = async (): Promise<boolean> => {
    if (!validateInquiry()) {
      return false;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        serviceId,
        serviceName: service?.serviceName,
        businessName: service?.businessName,
        serviceOwnerId: service?.userId,
        customerId: userData?.uid || null,
        customerName: inquiryData.customerName,
        customerEmail: inquiryData.customerEmail || null,
        customerPhone: inquiryData.customerPhone,
        message: inquiryData.message,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      sendInquiryNotification(userData?.uid || '', service?.userId || '', inquiryData.message);

      showToast('Inquiry submitted successfully!', 'success');
      return true;
    } catch (error) {
  
      showToast('Failed to submit inquiry. Please try again.', 'error');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateInquiryData = (field: keyof InquiryData, value: string) => {
    setInquiryData((prev) => ({ ...prev, [field]: value }));
  };

  const allImages = service 
    ? [service.bannerImage, ...service.images].filter(Boolean)
    : [];

  const isOwner = userData?.uid == service?.userId;

  return {
    // State
    service,
    loading,
    submitting,
    currentImageIndex,
    inquiryData,
    allImages,
    isOwner,
    
    // Toast
    toastVisible,
    toastMessage,
    toastType,
    setToastVisible,
    userData,
    
    // Actions
    setCurrentImageIndex,
    updateInquiryData,
    submitInquiry,
  };
};