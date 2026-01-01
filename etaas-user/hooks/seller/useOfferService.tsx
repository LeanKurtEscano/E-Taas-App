import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ServiceFormData } from '@/types/seller/services';
import { serviceApiClient } from '@/config/seller/service';
import { useQueryClient } from '@tanstack/react-query';
interface UseOfferServiceProps {
  serviceId?: string; // Optional serviceId for edit mode
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const useOfferService = ({ serviceId, showToast }: UseOfferServiceProps) => { 
   
  const queryClient = useQueryClient();
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

  const categoryMap: { [key: string]: number } = {
      'Food': 1,
      'Travel & Tours': 2,
      'Therapy': 3,
      'School Supplies': 4,
      'Agricultural': 5,
      'Clothing': 6,
      'Others': 7,
    };

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
      const response = await serviceApiClient.get(`/${serviceId}`);
      const data = response.data;

      setFormData({
        serviceName: data.service_name || '',
        businessName: data.business_name || '',
        ownerName: data.owner_name || '',
        contactNumber: data.service_contact || '',
        address: data.service_address || '',
        serviceDescription: data.description || '',
        category: Number(categoryMap[data.category_id]) || 0,
        priceRange: data.price_range || '',
        facebookLink: data.fb_link || '',
        availability: data.is_available ?? true,
        bannerImage: data.banner_image || '',
        images: data.images?.map((img: any) => img.image_url) || [],
      });

      showToast('Service loaded successfully', 'success');
    } catch (error: any) {
      console.error('Failed to fetch service:', error);
      showToast(error.response?.data?.detail || 'Failed to load service data', 'error');
    } finally {
      setFetchingService(false);
    }
  };

  const updateField = (field: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectCategory = (category: number) => {
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
      selectionLimit: 3 - formData.images.length,
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

  // Helper function to create FormData compatible file object for React Native
  const createFileFromUri = (uri: string, filename: string) => {
    // Extract file extension from URI
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    return {
      uri,
      name: filename,
      type: `image/${fileType}`,
    };
  };

  const submitService = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      setUploadingImages(true);

      // Step 1: Create/Update the service (without images first)
      const servicePayload = {
        service_name: formData.serviceName,
        owner_name: formData.ownerName,
        service_contact: formData.contactNumber,
        service_address: formData.address,
        description: formData.serviceDescription,
        category_id: getCategoryId(formData.category),
        price_range: formData.priceRange || null,
        fb_link: formData.facebookLink || null,
        is_available: formData.availability,
      };

      let createdServiceId: number;

      if (isEditMode && serviceId) {
        // Update existing service
        const response = await serviceApiClient.put(`/${serviceId}`, servicePayload);
        createdServiceId = parseInt(serviceId);
        showToast('Service updated successfully!', 'success');
      } else {
        // Create new service
        const response = await serviceApiClient.post('/add-service', servicePayload);
        createdServiceId = response.data.id;
        showToast('Service created successfully!', 'success');
      }

      // Step 2: Upload images if there are any new local images
      const newLocalImages = [formData.bannerImage, ...formData.images].filter(
        (uri) => uri && !isImageUrl(uri)
      );

      if (newLocalImages.length > 0) {
        const formDataImages = new FormData();

        // Add banner image if it's a new local file
        if (!isImageUrl(formData.bannerImage)) {
          const bannerFile = createFileFromUri(formData.bannerImage, 'banner.jpg');
          formDataImages.append('files', bannerFile as any);
        }

        // Add service images if they're new local files
        for (let i = 0; i < formData.images.length; i++) {
          const imageUri = formData.images[i];
          if (!isImageUrl(imageUri)) {
            const imageFile = createFileFromUri(imageUri, `service-${i}.jpg`);
            formDataImages.append('files', imageFile as any);
          }
        }

        // Upload images to the service
        await serviceApiClient.post(
          `/add-service-images/${createdServiceId}`,
          formDataImages,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

      }

      setUploadingImages(false);

      // Reset form if creating new service
      if (!isEditMode) {
        resetForm();
      }
    } catch (error: any) {
      console.error('Failed to submit service:', error);
      showToast(
        error.response?.data?.detail || 
        (isEditMode ? 'Failed to update service' : 'Failed to create service'),
        'error'
      );
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  // Helper to map category name to category_id (you'll need to adjust this)
  const getCategoryId = (categoryName: string): number => {
    
    return categoryMap[categoryName] || 7;
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