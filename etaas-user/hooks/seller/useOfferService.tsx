import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { db } from '@/config/firebaseConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import useCloudinary from '../image-upload/useCloudinary';
import { ServiceFormData } from '@/types/seller/services';
import { ingestApi } from '@/config/apiConfig';
import { router } from 'expo-router';


interface UseOfferServiceProps {
  userId: string;
  shopId?: Number;
  serviceId?: string; // Optional serviceId for edit mode
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const useOfferService = ({ userId,shopId, serviceId, showToast }: UseOfferServiceProps) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceName: '',
    businessName: '',
    ownerName: '',
    contactNumber: '',
    address: '',
    serviceDescription: '',
    category: '',
    priceRange: '',
    facebookLink: '',
    availability: true,
    bannerImage: '',
    images: [],
  });
  
  const { uploadImageToCloudinary } = useCloudinary();

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fetchingService, setFetchingService] = useState(false);
  const isEditMode = !!serviceId;

  const categories = [
    'Food',
    'Travel & Tours',
    'Therapy',
    'School Supplies',
    'Agricultural',
    'Clothing',
    'Others',
  ];

  // Fetch service data if in edit mode
  useEffect(() => {
    if (serviceId) {
      fetchServiceData();
    }
  }, [serviceId]);

  const fetchServiceData = async () => {
    if (!serviceId) return;
    
    setFetchingService(true);
    try {
      const serviceDoc = await getDoc(doc(db, 'services', serviceId));
      
      if (serviceDoc.exists()) {
        const data = serviceDoc.data() as ServiceFormData;
        setFormData({
          serviceName: data.serviceName || '',
          businessName: data.businessName || '',
          ownerName: data.ownerName || '',
          contactNumber: data.contactNumber || '',
          address: data.address || '',
          serviceDescription: data.serviceDescription || '',
          category: data.category || '',
          priceRange: data.priceRange || '',
          facebookLink: data.facebookLink || '',
          availability: data.availability ?? true,
          bannerImage: data.bannerImage || '',
          images: data.images || [],
        });
      } else {
        showToast('Service not found', 'error');
      }
    } catch (error) {
     
      showToast('Failed to load service data', 'error');
    } finally {
      setFetchingService(false);
    }
  };

  const updateField = (field: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectCategory = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const pickBannerImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      showToast('Camera roll permissions are required to upload images', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
      aspect: [16, 9],
    });

    if (!result.canceled && result.assets[0]) {
      setFormData((prev) => ({
        ...prev,
        bannerImage: result.assets[0].uri,
      }));
      showToast('Banner image added', 'success');
    }
  };

  const removeBannerImage = () => {
    setFormData((prev) => ({
      ...prev,
      bannerImage: '',
    }));
    showToast('Banner image removed', 'success');
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      showToast('Camera roll permissions are required to upload images', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 3,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...selectedImages].slice(0, 3),
      }));
      showToast(`${selectedImages.length} image(s) added`, 'success');
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    showToast('Image removed', 'success');
  };

  const validateForm = (): boolean => {
    if (!formData.serviceName.trim()) {
      showToast('Please enter a service name', 'error');
      return false;
    }
    if (!formData.businessName.trim()) {
      showToast('Please enter a business name', 'error');
      return false;
    }
    if (!formData.ownerName.trim()) {
      showToast('Please enter owner name', 'error');
      return false;
    }
    if (!formData.contactNumber.trim()) {
      showToast('Please enter a contact number', 'error');
      return false;
    }
    if (!formData.category) {
      showToast('Please select a category', 'error');
      return false;
    }
    if (!formData.serviceDescription.trim()) {
      showToast('Please enter a service description', 'error');
      return false;
    }
    if (!formData.bannerImage) {
      showToast('Please upload a banner image', 'error');
      return false;
    }
    return true;
  };

  const isImageUrl = (uri: string): boolean => {
    return uri.startsWith('http://') || uri.startsWith('https://');
  };

  const submitService = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      setUploadingImages(true);
      
      // Upload banner image only if it's a new local image
      let uploadedBannerUrl = formData.bannerImage;
      if (!isImageUrl(formData.bannerImage)) {
        uploadedBannerUrl = await uploadImageToCloudinary(formData.bannerImage);
      }

      // Upload service images only if they're new local images
      let uploadedImageUrls: string[] = [];
      if (formData.images.length > 0) {
        uploadedImageUrls = await Promise.all(
          formData.images.map(async (uri) => {
            if (isImageUrl(uri)) {
              return uri; // Already uploaded, keep the URL
            }
            return await uploadImageToCloudinary(uri);
          })
        );
      }
      
      setUploadingImages(false);

   
      const serviceData = {
        ...formData,
        bannerImage: uploadedBannerUrl,
        images: uploadedImageUrls,
        userId,
        shopId: shopId,
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode && serviceId) {
      
        const docRef = await updateDoc(doc(db, 'services', serviceId), serviceData);
        const uid = serviceId;
        /*
        const response = await ingestApi.put(`/shops/${shopId}/service`, {
          ...serviceData,
          uid: uid,
          images: uploadedImageUrls,
      });
      */

       const response = await ingestApi.put(`/shops/${shopId}/service`, {
          ...serviceData,
          uid: uid,
          images: uploadedImageUrls,
      });

      
        showToast('Service updated successfully!', 'success');
      } else {
       
        const docRef = await addDoc(collection(db, 'services'), {
          ...serviceData,
          createdAt: new Date().toISOString(),
        });

        const uid = docRef.id;
        /*
        const response = await ingestApi.post(`/shops/${shopId}/service`, {
          ...serviceData,
          uid: uid,
          images: uploadedImageUrls,
      }); 
      */

        const response = await ingestApi.post(`/shops/${shopId}/service`, {
          ...serviceData,
          uid: uid,
          images: uploadedImageUrls,
      }); 

         router.push('/(tabs)/services');
      
        showToast('Service added successfully!', 'success');
        resetForm();
      }
    } catch (error) {

      showToast(
        isEditMode ? 'Failed to update service. Please try again.' : 'Failed to add service. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      serviceName: '',
      businessName: '',
      ownerName: '',
      contactNumber: '',
      address: '',
      serviceDescription: '',
      category: '',
      priceRange: '',
      facebookLink: '',
      availability: true,
      bannerImage: '',
      images: [],
    });
  };

  return {
    formData,
    loading,
    uploadingImages,
    fetchingService,
    isEditMode,
    categories,
    updateField,
    selectCategory,
    pickBannerImage,
    removeBannerImage,
    pickImages,
    removeImage,
    submitService,
  };
};