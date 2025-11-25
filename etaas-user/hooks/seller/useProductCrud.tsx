import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import useSellerStore from '@/hooks/seller/useSellerStore';
import { useRouter } from 'expo-router';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { VariantCategory, Variant } from '@/types/product/product';
import { validateProductName, validatePrice, validateStock, validateDescription } from '@/utils/validation/seller/productCrudValidation';
import { useRef } from 'react';
import { TextInput } from 'react-native';
import { ingestApi, sellerApi } from '@/config/apiConfig';

interface UseProductCrudProps {
    sellerId: string | undefined;
    sellerIdInt?: number;
    productId: string | undefined;
    showToast: (message: string, type: 'success' | 'error') => void;
    setFieldErrors: React.Dispatch<React.SetStateAction<{
        productName: boolean;
        productPrice: boolean;
        productDescription: boolean;
    }>>;
}



export const useProductCrud = ({ sellerId, sellerIdInt, productId, showToast, setFieldErrors }: UseProductCrudProps) => {
    const router = useRouter();
    const sellerStore = useSellerStore();


    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productCategory, setProductCategory] = useState('Clothing');
    const [productAvailability, setProductAvailability] = useState<'available' | 'sold' | 'reserved'>('available');
    const [productQuantity, setProductQuantity] = useState(0);


    const [imageUris, setImageUris] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [imageError, setImageError] = useState('');


    const [variantModalVisible, setVariantModalVisible] = useState(false);
    const [hasVariants, setHasVariants] = useState(false);
    const [variantCategories, setVariantCategories] = useState<VariantCategory[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);


    const [loading, setLoading] = useState(false);
    const [fetchingProduct, setFetchingProduct] = useState(false);

    const categories = ['Clothing', 'Accessories', 'Electronics', 'Home', 'Food & Beverages', 'Others'];
    const availabilityOptions: Array<'available' | 'out of stock' | 'unavailable'> = ['available', 'out of stock', 'unavailable'];

    const productNameRef = useRef<TextInput>(null);
    const productPriceRef = useRef<TextInput>(null);
    const productDescriptionRef = useRef<TextInput>(null);

    useEffect(() => {
        const fetchProductData = async () => {
            if (!productId) return;

            setFetchingProduct(true);
            try {
                const productRef = doc(db, 'products', productId);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const data = productSnap.data();
                    setProductName(data.name || '');
                    setProductPrice(data.price?.toString() || '');
                    setProductDescription(data.description || '');
                    setProductCategory(data.category || 'Clothing');
                    setProductAvailability(data.availability || 'available');
                    setProductQuantity(data.quantity || 0);


                    setHasVariants(data.hasVariants || false);
                    setVariantCategories(data.variantCategories || []);
                    setVariants(data.variants || []);

                    const existingImages = data.images || [];
                    setImageUris(existingImages);
                    setExistingImageUrls(existingImages);
                } else {
                    showToast('Product not found', 'error');
                    router.back();
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                showToast('Failed to load product data', 'error');
                router.back();
            } finally {
                setFetchingProduct(false);
            }
        };

        fetchProductData();
    }, [productId]);


    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                showToast('Please grant camera roll permissions', 'error');
                return;
            }

            const pickerOptions: ImagePicker.ImagePickerOptions = {
                allowsEditing: true,
                aspect: [16, 9] as [number, number],
                quality: 0.8,
            };


            const result = await ImagePicker.launchImageLibraryAsync({
                ...pickerOptions,
                mediaTypes: ["images"],
            });

            if (!result.canceled && result.assets) {
                const newUris = result.assets.map(asset => asset.uri);
                setImageUris(prev => [...prev, ...newUris]);
                setImageError('');
            }
        } catch (error) {
            console.error('Error picking images:', error);
            showToast('Failed to pick images', 'error');
        }

    }


    const removeImage = (index: number) => {
        const imageToRemove = imageUris[index];

        if (existingImageUrls.includes(imageToRemove)) {
            setImagesToDelete(prev => [...prev, imageToRemove]);
        }

        setImageUris(prev => prev.filter((_, i) => i !== index));
    };


    const incrementQuantity = () => {
    const MAX_QUANTITY = 9999;
    setProductQuantity(prev => (prev < MAX_QUANTITY ? prev + 1 : prev));
};

    const decrementQuantity = () => {
        setProductQuantity(prev => (prev > 1 ? prev - 1 : 0));
    };


    const handleSaveVariants = (categories: VariantCategory[], variantsList: Variant[]) => {
        setVariantCategories(categories);
        setVariants(variantsList);
        setHasVariants(true);
        showToast('Variants saved successfully!', 'success');
    };

    // Toggle variants
    const toggleVariants = () => {
        if (hasVariants) {
            // Show confirmation before disabling
            // Note: You'll need to handle this in the component since we can't use Alert in the hook
            return 'confirm'; // Return signal to show confirmation dialog
        } else {
            setHasVariants(true);
        }
    };

    // Disable variants
    const disableVariants = () => {
        setHasVariants(false);
        setVariantCategories([]);
        setVariants([]);
    };


    const validateForm = (): boolean => {
        if (!sellerId) {
            showToast('Seller ID is required', 'error');
            return false;
        }

        const validateProductNameResult = validateProductName(productName.trim());
        if (validateProductNameResult) {
            setFieldErrors({ productName: true, productPrice: false, productDescription: false });
            productNameRef.current?.focus();
            showToast(validateProductNameResult, 'error');
            return false;
        }

        const validatePriceResult = validatePrice(productPrice.trim());
        if (validatePriceResult) {
            setFieldErrors({ productName: false, productPrice: true, productDescription: false });
            productPriceRef.current?.focus();
            showToast(validatePriceResult, 'error');
            return false;
        }

        const validateDescriptionResult = validateDescription(productDescription.trim());
        if (validateDescriptionResult) {
            setFieldErrors({ productName: false, productPrice: false, productDescription: true });
            productDescriptionRef.current?.focus();
            showToast(validateDescriptionResult, 'error');
            return false;
        }


        if (!productName.trim()) {
            showToast('Please enter product name', 'error');
            return false;
        }

        if (!hasVariants && (!productPrice.trim() || isNaN(Number(productPrice)))) {
            showToast('Please enter valid price', 'error');
            return false;
        }

        if (imageUris.length === 0) {
            setImageError('Please add at least one image');
            showToast('Please add at least one image', 'error');
            return false;
        }

        if (hasVariants) {
            if (variantCategories.length === 0 || variants.length === 0) {
                showToast('Please configure variants or disable variants', 'error');
                return false;
            }

            const invalidVariants = variants.filter(v => v.price <= 0);
            if (invalidVariants.length > 0) {
                showToast('All variants must have valid price and stock', 'error');
                return false;
            }
        }

        return true;
    };


    const handleSubmit = async () => {
        if (!validateForm()) return;


        setLoading(true);

        try {
            const productData = {
                name: productName.trim(),
                price: Number(productPrice),
                description: productDescription.trim(),
                category: productCategory,
                availability: productAvailability,
                quantity: hasVariants ? 0 : productQuantity,
                sellerId: sellerId!,
                hasVariants,
                ...(hasVariants && {
                    variantCategories,
                    variants,
                }),
            };


            const ragProductData = {
                name: productName.trim(),
                price: Number(productPrice),
                description: productDescription.trim(),
                category: productCategory,
                availability: productAvailability,
                quantity: hasVariants ? 0 : productQuantity,
                sellerId: sellerIdInt,
                hasVariants,
                ...(hasVariants && {
                    variantCategories,
                    variants,
                }),
            };


            if (productId) {
                // Separate existing images from new ones
                const existingImages = imageUris.filter(uri => existingImageUrls.includes(uri));
                const newImages = imageUris.filter(uri => !existingImageUrls.includes(uri));

                await sellerStore.updateProduct(
                    productId,
                    productData,
                    newImages,
                    existingImages,
                    imagesToDelete
                );
                showToast('Product updated successfully!', 'success');
            } else {
                console.log('Submitting new product with data:', ragProductData);
                const uid = await sellerStore.addProduct(productData, imageUris);
                await sellerStore.addRagProduct({ ...ragProductData, uid: uid }, imageUris);

                showToast('Product added successfully!', 'success');
            }

            router.back();
        } catch (error) {
            console.error('Error saving product:', error);
            showToast('Failed to save product. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

   const handleQuantityChange = (text: string) => {
    const MAX_QUANTITY = 9999;
    
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
        setProductQuantity(0);
        return;
    }
    
    const quantity = parseInt(numericValue, 10);
    
    if (isNaN(quantity)) {
        setProductQuantity(0);
    } else if (quantity > MAX_QUANTITY) {
        // Don't update if it exceeds max - just stop at max
        setProductQuantity(MAX_QUANTITY);
    } else {
        setProductQuantity(quantity);
    }
};


    const visibleImages = imageUris.slice(0, 2);
    const remainingCount = imageUris.length - 2;

    return {
        // State
        productName,
        productPrice,
        productDescription,
        productCategory,
        productAvailability,
        productQuantity,
        imageUris,
        imageError,
        variantModalVisible,
        hasVariants,
        variantCategories,
        variants,
        loading,
        fetchingProduct,

        // Setters
        setProductName,
        setProductPrice,
        setProductDescription,
        setProductCategory,
        setProductAvailability,
        setVariantModalVisible,

        // Functions
        pickImages,
        removeImage,
        incrementQuantity,
        decrementQuantity,
        handleSaveVariants,
        toggleVariants,
        disableVariants,
        handleSubmit,

        // Constants
        categories,
        availabilityOptions,

        // Computed
        visibleImages,
        remainingCount,
        productNameRef,
        productPriceRef,
        productDescriptionRef,
        handleQuantityChange,
    };


};