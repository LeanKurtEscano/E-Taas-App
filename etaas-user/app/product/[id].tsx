import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Truck, 
  Star, 
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Edit3,
  Package,
  Store,
  Shield,
  Award,
  Clock,
  MapPin,
  MessageCircle,
  Heart,
  Share2,
  Info
} from 'lucide-react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { fetchProductData } from '@/services/seller/shop/shop';
import { Product, UserData } from '@/types/seller/shop';
import { getInitials } from '@/utils/general/initials';
import { fetchShopBySellerId } from '@/services/general/getShop';
import ProductDetailsModal from '@/components/user/browseProduct/VariantModal';
const ViewProductScreen = () => {

  const router = useRouter();
  const { userData } = useCurrentUser();
  const {id} = useLocalSearchParams();

  const productId = id as string | undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopData, setShopData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
 
  const mockShopData = {
    totalProducts: 127,
    rating: 4.8,
    reviewCount: 127,
    responseRate: '98%',
    responseTime: '2 hours',
    joinedDate: 'Jan 2024',
    location: 'Naic, Cavite',
  };


  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
       
        const fetchedProduct = await fetchProductData(productId);
        const shopData = await fetchShopBySellerId(fetchedProduct?.sellerId || '');
        console.log(fetchedProduct);

        if(shopData) {
          setShopData(shopData);
        } else {
          setError('Unable to load shop details');
        }
        
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setSelectedImage(fetchedProduct.images?.[0] || '');
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Unable to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleAddToCart = () => {
    console.log('Add to cart:', product?.name);
    // Implement add to cart logic
  };

  const handleBuyDirectly = () => {
    console.log('Buy directly:', product?.name);
    // Navigate to checkout
  };



  const handleViewOrders = () => {
  
  };

  

  const handleShare = () => {
    console.log('Share product');
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleContactSeller = () => {
    console.log('Contact seller');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF4D9F" />
          <Text className="mt-4 text-gray-600">Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-bold text-gray-800 mb-2">Oops!</Text>
          <Text className="text-gray-600 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-pink-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = userData?.uid === product.sellerId;
  const shopName = shopData?.sellerInfo?.shopName || 'Shop';
  const businessName = shopData?.sellerInfo?.businessName || '';
  const shopInitials = getInitials(shopName);

  const descriptionLength = product.description?.length || 0;
  const shouldTruncate = descriptionLength > 150;
  const displayDescription = shouldTruncate && !showFullDescription
    ? product?.description.substring(0, 150) + '...'
    : product?.description;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1">
       
        <View className="bg-gray-100">
          <Image
            source={{ uri: selectedImage }}
            className="w-full h-96"
            resizeMode="cover"
          />
          
          <View className="absolute top-4 left-4 right-4 flex-row justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white w-10 h-10 rounded-full items-center justify-center shadow-lg"
              style={{ elevation: 5 }}
            >
              <ArrowLeft size={24} color="#1F2937" strokeWidth={2.5} />
            </TouchableOpacity>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleShare}
                className="bg-white w-10 h-10 rounded-full items-center justify-center shadow-lg"
                style={{ elevation: 5 }}
              >
                <Share2 size={20} color="#1F2937" strokeWidth={2.5} />
              </TouchableOpacity>
              
              {!isOwner && (
                <TouchableOpacity
                  onPress={handleToggleFavorite}
                  className="bg-white w-10 h-10 rounded-full items-center justify-center shadow-lg"
                  style={{ elevation: 5 }}
                >
                  <Heart 
                    size={20} 
                    color={isFavorite ? "#EC4899" : "#1F2937"} 
                    fill={isFavorite ? "#EC4899" : "none"}
                    strokeWidth={2.5} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {product.availability === 'available' && (
            <View className="absolute bottom-4 right-4 bg-green-500 px-3 py-1.5 rounded-lg flex-row items-center">
              <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text className="text-white font-semibold text-xs ml-1">In Stock</Text>
            </View>
          )}
        </View>

    
        {product.images && product.images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-3 bg-gray-50"
          >
            {product.images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(image)}
                className={`mr-2 rounded-lg overflow-hidden border-2 ${
                  selectedImage === image ? 'border-pink-500' : 'border-gray-200'
                }`}
              >
                <Image
                  source={{ uri: image }}
                  className="w-20 h-20"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </Text>
          
          <View className="flex-row items-end mb-4">
            <Text className="text-3xl font-bold text-pink-600">
              ₱{product.price.toLocaleString()}
            </Text>
            {/* Optional: Show original price if on sale */}
            {/* <Text className="text-lg text-gray-400 line-through ml-2">
              ₱{(product.price * 1.2).toLocaleString()}
            </Text> */}
          </View>

          <View className="flex-row items-center flex-wrap mb-4">
            <View className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 mb-2">
              <Text className="text-gray-700 text-sm font-medium">{product.category}</Text>
            </View>
            <View className="bg-blue-50 px-3 py-1.5 rounded-full mb-2">
              <Text className="text-blue-700 text-sm font-medium">
                {product.quantity} available
              </Text>
            </View>
          </View>

          {/* Product Highlights */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Product Highlights
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-4 px-4"
            >
              <View className="flex-row items-center bg-pink-50 px-4 py-3 rounded-full mr-2">
                <Shield size={16} color="#EC4899" strokeWidth={2.5} />
                <Text className="text-gray-700 text-sm font-medium ml-2">
                  High quality materials
                </Text>
              </View>
              <View className="flex-row items-center bg-purple-50 px-4 py-3 rounded-full mr-2">
                <Truck size={16} color="#9333EA" strokeWidth={2.5} />
                <Text className="text-gray-700 text-sm font-medium ml-2">
                  Fast shipping available
                </Text>
              </View>
              
              <View className="flex-row items-center bg-pink-50 px-4 py-3 rounded-full mr-2">
                <Shield size={16} color="#EC4899" strokeWidth={2.5} />
                <Text className="text-gray-700 text-sm font-medium ml-2">
                  Money-back guarantee
                </Text>
              </View>
              <View className="flex-row items-center bg-purple-50 px-4 py-3 rounded-full mr-2">
                <Award size={16} color="#9333EA" strokeWidth={2.5} />
                <Text className="text-gray-700 text-sm font-medium ml-2">
                  Verified seller
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Description
            </Text>
            <Text className="text-gray-600 leading-6">
              {displayDescription}
            </Text>
            {shouldTruncate && (
              <TouchableOpacity
                onPress={() => setShowFullDescription(!showFullDescription)}
                className="mt-2"
              >
                <Text className="text-pink-600 font-semibold">
                  {showFullDescription ? 'See Less' : 'See More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

    
          <View className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 mb-4 border border-pink-100">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Store size={18} color="#EC4899" strokeWidth={2.5} />
                <Text className="text-base font-bold text-gray-800 ml-2">
                  Shop Information
                </Text>
              </View>
              
             
                <TouchableOpacity
                  onPress={() => isOwner ? router.push(`/seller/store`) : router.push(`/shop/${product.sellerId}`)}
                  className="flex-row items-center border border-pink-500 bg-white px-4 py-2 rounded-lg "
                  style={{ elevation: 2 }}
                >
                  <Store size={14} color="#EC4899" strokeWidth={2.5} />
                  <Text className="text-pink-500 font-semibold text-sm ml-1.5">
                    {isOwner ? 'View My Shop' : 'Visit Shop'}
                  </Text>
                  <ChevronRight size={14} color="#EC4899" strokeWidth={2.5} />
                </TouchableOpacity>
            
            </View>
            
            <View className="flex-row items-start mb-4">
              <View className="w-16 h-16 bg-pink-500 rounded-full items-center justify-center mr-3  ">
                <Text className="text-white font-bold text-xl">
                  {shopInitials}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  {shopName}
                </Text>
                {businessName && (
                  <Text className="text-sm text-gray-600 mb-2">{businessName}</Text>
                )}
                
                <View className="flex-row items-center flex-wrap">
                  <View className="flex-row items-center mr-4 mb-1.5">
                    <Star size={14} color="#EAB308" fill="#EAB308" strokeWidth={2} />
                    <Text className="text-gray-700 font-semibold text-sm ml-1">
                      {mockShopData.rating}
                    </Text>
                    <Text className="text-gray-500 text-xs ml-1">
                      ({mockShopData.reviewCount} reviews)
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center mb-1.5">
                    <Package size={12} color="#6B7280" strokeWidth={2} />
                    <Text className="text-gray-500 text-xs ml-1">
                      {mockShopData.totalProducts} Products
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Shop Stats 
               <View className="bg-white rounded-lg p-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <Clock size={14} color="#6B7280" strokeWidth={2} />
                  <Text className="text-gray-600 text-xs ml-1.5">Response Time</Text>
                </View>
                <Text className="text-gray-900 font-semibold text-xs">
                  {mockShopData.responseTime}
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <Shield size={14} color="#6B7280" strokeWidth={2} />
                  <Text className="text-gray-600 text-xs ml-1.5">Response Rate</Text>
                </View>
                <Text className="text-gray-900 font-semibold text-xs">
                  {mockShopData.responseRate}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <MapPin size={14} color="#6B7280" strokeWidth={2} />
                  <Text className="text-gray-600 text-xs ml-1.5">Location</Text>
                </View>
                <Text className="text-gray-900 font-semibold text-xs">
                  {mockShopData.location}
                </Text>
              </View>
            </View>
            
            */}
           

            {!isOwner && (
              <TouchableOpacity
                onPress={handleContactSeller}
                className="bg-white border border-pink-500 rounded-lg py-3 mt-3 flex-row items-center justify-center"
              >
                <MessageCircle size={16} color="#EC4899" strokeWidth={2.5} />
                <Text className="text-pink-600 font-semibold text-sm ml-2">
                  Contact Seller
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Additional Information */}
          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Info size={16} color="#3B82F6" strokeWidth={2.5} />
              <Text className="text-base font-semibold text-gray-800 ml-2">
                Important Information
              </Text>
            </View>
            <View className="flex-row items-start mb-2">
              <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2" />
              <Text className="text-gray-700 text-sm flex-1">
                Please check product details before purchasing
              </Text>
            </View>
            <View className="flex-row items-start mb-2">
              <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2" />
              <Text className="text-gray-700 text-sm flex-1">
                Contact seller for bulk orders or customization
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2" />
              <Text className="text-gray-700 text-sm flex-1">
                Returns accepted within 7 days of delivery
              </Text>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      <SafeAreaView edges={['bottom']} className="bg-white border-t border-gray-200 ">
        <View className="px-4 py-3">
          {isOwner ? (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push(`/seller/product?productId=${id}`)}
                className="flex-1 bg-white border border-pink-500 py-4 rounded-xl flex-row items-center justify-center"
                style={{ elevation: 3 }}
              >
                <Edit3 size={18} color="#EC4899" strokeWidth={2.5} />
                <Text className="text-pink-500 font-bold text-center text-base ml-2">
                  Edit Product
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleViewOrders}
                className="flex-1 bg-pink-500 border-2 border-pink-500 py-4 rounded-xl flex-row items-center justify-center"
              >
                <Package size={18} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-white font-bold text-center text-base ml-2">
                  View Orders
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowVariantModal(true)}
                className="flex-1 bg-white border-2 border-pink-500 py-4 rounded-xl flex-row items-center justify-center"
              >
                <ShoppingCart size={18} color="#EC4899" strokeWidth={2.5} />
                <Text className="text-pink-500 font-bold text-center text-base ml-2">
                  Add to Cart
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleBuyDirectly}
                className="flex-1 bg-pink-500 py-4 rounded-xl flex-row items-center justify-center"
                style={{ elevation: 3 }}
              >
                <CreditCard size={18} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-white font-bold text-center text-base ml-2">
                  Buy Now
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
         
         <ProductDetailsModal
  isVisible={showVariantModal}
  onClose={() => setShowVariantModal(false)}
    product={product}
   onAddToCart={(product, variant, quantity) => {
    console.log('Add to cart:', product.name, variant, quantity);
    // Add your cart logic here
    setShowVariantModal(false); // Close modal after adding
  }}
/>
      </SafeAreaView>
    </SafeAreaView>
  );
};

export default ViewProductScreen;