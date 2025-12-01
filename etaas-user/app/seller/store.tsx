// screens/MyShopScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ShopHeader } from '@/components/seller/sellerShopScreen/ShopHeader';
import { SearchFilterBar } from '@/components/seller/sellerShopScreen/SearchFilterBar';
import { CategoryTabs } from '@/components/seller/sellerShopScreen/CategoryTabs';
import { ProductCard } from '@/components/seller/sellerShopScreen/ProductCard';
import { EmptyState } from '@/components/seller/sellerShopScreen/EmptyState';
import { FloatingAddButton } from '@/components/seller/sellerShopScreen/FloatingAddButton';
import { EditShopForm } from '@/components/seller/sellerShopScreen/EditShopForm';
import useSellerStore from '@/hooks/seller/useSellerStore';
import { updateSellerInfo } from '@/services/seller/shop/shop';
import { Product, ShopData, ViewMode } from '@/types/seller/shop';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import useCloudinary from '@/hooks/image-upload/useCloudinary';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import useToast from '@/hooks/general/useToast';
import GeneralToast from '@/components/general/GeneralToast';
const MyShopScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { uploadImageToCloudinary } = useCloudinary();
  const { userData } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [sellerData, setSellerData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { listenToSellerProducts } = useSellerStore();
  const { toastVisible, toastMessage, toastType, showToast, setToastVisible } = useToast();
  // Determine which user ID to use (passed id or current user)
  const sellerId = id || userData?.uid;
  const isOwner = !id || id === userData?.uid;

  const categories = [
    'All',
    'Clothing',
    'Accessories',
    'Electronics',
    'Home',
    'Food & Beverages',
    'Others',
  ];

  const shopData: ShopData = {
    shopName: (sellerData || userData)?.sellerInfo?.shopName || '',
    businessName: (sellerData || userData)?.sellerInfo?.businessName || '',
    addressLocation: (sellerData || userData)?.sellerInfo?.addressLocation || '',
    contactNumber: (sellerData || userData)?.sellerInfo?.contactNumber || '',
    email: (sellerData || userData)?.sellerInfo?.email || '',
    rating: 4.8,
    reviewCount: 127,
    followers: 1523,
    description: (sellerData || userData)?.sellerInfo?.description || 'Quality thrift finds at affordable prices! ✨',
  };

  // Fetch seller data if viewing another seller's shop
  useEffect(() => {
    const fetchSellerData = async () => {
      if (id && id !== userData?.uid) {
        try {
          setLoading(true);
          const userRef = doc(db, 'users', id);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setSellerData({ uid: userSnap.id, ...userSnap.data() });
          } else {
            showToast('Shop not found', 'error');
            router.back();
          }
        } catch (error) {
         
          showToast('Failed to load shop data', 'error');
        } finally {
          setLoading(false);
        }
      } else {
        setSellerData(null);
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id, userData?.uid]);

  // Listen to products for the seller
  useEffect(() => {
    if (!sellerId) return;

    const unsubscribe = listenToSellerProducts(sellerId, (newProducts) => {
      setProducts(newProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sellerId]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Request permission and pick image
  const pickImage = async (type: 'cover' | 'profile') => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showToast(
          'Please grant camera roll permissions to upload images.',
          'error'
        );
        return;
      }

      // Configure image picker based on type
      const pickerConfig: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      };

      if (type === 'cover') {
        // Rectangle crop for banner (16:9 aspect ratio)
        pickerConfig.aspect = [16, 9];
      } else {
        // Circle crop for profile (1:1 aspect ratio will be displayed as circle)
        pickerConfig.aspect = [1, 1];
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync(pickerConfig);

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri, type);
      }
    } catch (error) {
     
      showToast('Failed to pick image', 'error');
    }
  };

  // Upload image to Cloudinary and update Firestore
  const uploadImage = async (uri: string, type: 'cover' | 'profile') => {
    if (!userData?.uid) return;

    setUploadingImage(true);
    try {
      // Upload to Cloudinary
      const folder = type === 'cover' ? 'shop-covers' : 'shop-profiles';
      const imageUrl = await uploadImageToCloudinary(uri, folder);

      // Update Firestore
      const updateField = type === 'cover' ? 'coverPhotoUrl' : 'profilePhotoUrl';
      await updateSellerInfo(userData.uid, {
        [updateField]: imageUrl,
      });

      showToast(
        
        `${type === 'cover' ? 'Cover' : 'Profile'} photo updated successfully`,
        'success'
      );
    } catch (error) {
    
      showToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditShop = () => {
    if (!isOwner) {
       showToast('You do not have permission to edit this shop.', 'error');
      return;
    }
    setShowEditModal(true);
  };

  const handleSaveShopDetails = async (formData: any) => {
    if (!userData?.uid) return;

    try {
      await updateSellerInfo(userData.uid, formData);
    } catch (error) {
      throw error;
    }
  };

  const handleFilterPress = () => {
    Alert.alert('Filter', 'Filter options will appear here');
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleCoverPhotoPress = () => {
    Alert.alert(
      'Cover Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select from Gallery',
          onPress: () => pickImage('cover'),
        },
      ]
    );
  };

  const handleProfilePhotoPress = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select from Gallery',
          onPress: () => pickImage('profile'),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 py-3 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          {isOwner ? 'My Shop' : 'Shop'}
        </Text>
      </View>

      {/* Loading Overlay for Image Upload */}
      {uploadingImage && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center z-50">
          <View className="bg-white rounded-lg p-6 items-center">
            <ActivityIndicator size="large" color="#E91E8C" />
            <Text className="mt-3 text-gray-700">Uploading image...</Text>
          </View>
        </View>
      )}

      {/* Loading Overlay for Image Upload */}
      {uploadingImage && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 items-center justify-center z-50">
          <View className="bg-white rounded-lg p-6 items-center">
            <ActivityIndicator size="large" color="#E91E8C" />
            <Text className="mt-3 text-gray-700">Uploading image...</Text>
          </View>
        </View>
      )}

      <ScrollView className="flex-1">
        <ShopHeader
          shopData={shopData}
          isOwner={isOwner}
          onEdit={handleEditShop}
          onCoverPhotoPress={handleCoverPhotoPress}
          onProfilePhotoPress={handleProfilePhotoPress}
          coverPhotoUrl={(sellerData || userData)?.sellerInfo?.coverPhotoUrl}
          profilePhotoUrl={(sellerData || userData)?.sellerInfo?.profilePhotoUrl}
        />

        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterPress={handleFilterPress}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {loading ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#E91E8C" />
          </View>
        ) : !filteredProducts || filteredProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <View className="p-3">
            {viewMode === 'grid' ? (
              <View className="flex-row flex-wrap justify-between">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onPress={() => handleProductPress(product)}
                    onEdit={() => router.push(`/seller/product?productId=${product.id}`)}
                  />
                ))}
              </View>
            ) : (
              <View>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onPress={() => handleProductPress(product)}
                      onEdit={isOwner ? () => router.push(`/seller/product?productId=${product.id}`) : undefined}
                    isOwner={isOwner}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {isOwner && <FloatingAddButton onPress={() => router.push('/seller/product')} />}

      {/* Edit Shop Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView className="flex-1">
          <EditShopForm
            initialData={{
              shopName: shopData.shopName,
              businessName: shopData.businessName,
              addressLocation: shopData.addressLocation,
              contactNumber: shopData.contactNumber,
              email: shopData.email,
              description: shopData.description,
            }}
            onSave={handleSaveShopDetails}
            onCancel={() => setShowEditModal(false)}
          />
        </SafeAreaView>
      </Modal>
      <GeneralToast visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
};

export default MyShopScreen;