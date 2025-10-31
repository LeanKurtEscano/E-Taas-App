import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { db } from '@/config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

interface ServiceFormData {
  serviceName: string;
  businessName: string;
  ownerName: string;
  contactNumber: string;
  address: string;
  serviceDescription: string;
  category: string;
  priceRange: string;
  facebookLink: string;
  availability: boolean;
  bannerImage: string;
  images: string[];
}

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

interface UseOfferServiceProps {
  userId: string;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const useOfferService = ({ userId, showToast }: UseOfferServiceProps) => {
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

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const categories = [
    'Food',
    'Travel & Tours',
    'Therapy',
    'School Supplies',
    'Agricultural',
    'Clothing',
    'Others',
  ];

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

  const uploadImageToCloudinary = async (uri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.secure_url;
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

  const submitService = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      setUploadingImages(true);
      
      // Upload banner image
      const uploadedBannerUrl = await uploadImageToCloudinary(formData.bannerImage);

      // Upload service images to Cloudinary
      let uploadedImageUrls: string[] = [];
      if (formData.images.length > 0) {
        uploadedImageUrls = await Promise.all(
          formData.images.map((uri) => uploadImageToCloudinary(uri))
        );
      }
      
      setUploadingImages(false);

      // Save to Firestore
      const serviceData = {
        ...formData,
        bannerImage: uploadedBannerUrl,
        images: uploadedImageUrls,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'services'), serviceData);

      showToast('Service added successfully!', 'success');
      resetForm();
    } catch (error) {
      console.error('Error adding service:', error);
      showToast('Failed to add service. Please try again.', 'error');
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