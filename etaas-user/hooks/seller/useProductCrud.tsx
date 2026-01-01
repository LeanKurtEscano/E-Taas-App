import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { VariantCategory, Variant } from '@/types/product/product';
import { validateProductName, validatePrice, validateStock, validateDescription } from '@/utils/validation/seller/productCrudValidation';
import { useRef } from 'react';
import { TextInput } from 'react-native';
import { productApiClient } from '@/config/seller/product';
import { useQueryClient } from '@tanstack/react-query';

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
    const queryClient = useQueryClient();

    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productCategory, setProductCategory] = useState('Clothing');
    const [productAvailability, setProductAvailability] = useState<'available' | 'out of stock' | 'unavailable'>(null);
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

    // Helper to check if ID is from database (numeric) or temporary
    const isExistingVariant = (id: string): boolean => {
        const numericId = Number(id);
        return !isNaN(numericId) && numericId > 0;
    };

    useEffect(() => {
        const fetchProductData = async () => {
            if (!productId) return;

            setFetchingProduct(true);
            try {
                const response = await productApiClient.get(`/${productId}`);

                if (response.data && response.data.product) {
                    const productData = response.data.product;
                    const variantsData = response.data.variants || [];

                    setProductName(productData.product_name || '');
                    setProductPrice(productData.base_price?.toString() || '');
                    setProductDescription(productData.description || '');

                    const categoryName = productData.category?.name || 'Clothing';
                    setProductCategory(categoryName);

                    setProductAvailability(productData.stock > 0 ? 'available' : 'out of stock');
                    setProductQuantity(productData.stock || 0);
                    setHasVariants(productData.has_variants || false);

                    if (productData.has_variants && productData.variant_categories) {
                        const mappedCategories: VariantCategory[] = productData.variant_categories.map((cat: any) => ({
                            id: cat.id?.toString() || Math.random().toString(), // Keep DB ID as string
                            name: cat.category_name,
                            values: cat.attributes?.map((attr: any) => attr.value) || []
                        }));

                        setVariantCategories(mappedCategories);

                        if (variantsData.length > 0) {
                            const mappedVariants: Variant[] = variantsData.map((variant: any) => {
                                const attributeCombination: Record<string, string> = {};

                                if (variant.attributes && variant.attributes.length > 0) {
                                    variant.attributes.forEach((attr: any) => {
                                        const categoryName = attr.category?.category_name;
                                        const attributeValue = attr.value;

                                        if (categoryName && attributeValue) {
                                            attributeCombination[categoryName] = attributeValue;
                                        }
                                    });
                                }

                                return {
                                    id: variant.id?.toString() || Math.random().toString(), // Keep DB ID as string
                                    name: variant.variant_name || '',
                                    stock: variant.stock || 0,
                                    price: variant.price || 0,
                                    combination: attributeCombination,
                                    imageUri: variant.image_url || undefined,
                                };
                            });

                            setVariants(mappedVariants);
                        }
                    }

                    if (productData.images && productData.images.length > 0) {
                        const imageUrls = productData.images.map((img: any) => img.image_url);
                        setImageUris(imageUrls);
                        setExistingImageUrls(imageUrls);
                    }
                } else {
                    showToast('Product not found', 'error');
                    router.back();
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
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
        setProductAvailability('available');
    };

    const decrementQuantity = () => {
        setProductQuantity(prev => (prev > 1 ? prev - 1 : 0));
        if (productQuantity - 1 == 0) {
            setProductAvailability('out of stock');
        }
    }

    const handleSaveVariants = (categories: VariantCategory[], variantsList: Variant[]) => {
        setVariantCategories(categories);
        setVariants(variantsList);
        setHasVariants(true);
        showToast('Variants saved successfully!', 'success');
    };

    const toggleVariants = () => {
        if (hasVariants) {
            return 'confirm';
        } else {
            setHasVariants(true);
        }
    };

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

        if (productAvailability == null) {
            showToast('Please select product availability', 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const categoryMap: Record<string, number> = {
                'Clothing': 1,
                'Accessories': 2,
                'Electronics': 3,
                'Home': 4,
                'Food & Beverages': 5,
                'Others': 6,
            };

            if (productId) {
                // ============================================
                // UPDATE EXISTING PRODUCT
                // ============================================

                // 1. Update product info and variant categories
                const updatePayload = {
                    product: {
                        product_name: productName.trim(),
                        description: productDescription.trim(),
                        base_price: Number(productPrice),
                        stock: hasVariants ? 0 : productQuantity,
                        has_variants: hasVariants,
                        category_id: categoryMap[productCategory] || 1,
                    },
                    variant_categories: hasVariants ? variantCategories.map(cat => {
                        const categoryId = Number(cat.id);
                        const categoryData: any = {
                            category_name: cat.name,
                            attributes: cat.values.map(value => ({ value }))
                        };

                        // Include ID only for existing categories (numeric IDs)
                        if (!isNaN(categoryId) && categoryId > 0) {
                            categoryData.id = categoryId;
                        }

                        return categoryData;
                    }) : []
                };

                await productApiClient.put(`/update-product/${productId}`, updatePayload);

                // 2. Separate existing and new variants
                const existingVariants = variants.filter(v => isExistingVariant(v.id));
                const newVariants = variants.filter(v => !isExistingVariant(v.id));

                // 3. Update existing variants (with images)
                if (hasVariants && existingVariants.length > 0) {
                    const formData = new FormData();

                    const variantIds: number[] = [];
                    const variantData: Array<{ stock: number; price: number }> = [];

                    existingVariants.forEach(variant => {
                        variantIds.push(Number(variant.id));
                        variantData.push({
                            stock: variant.stock,
                            price: variant.price
                        });
                    });

                    formData.append('variant_ids', JSON.stringify(variantIds));
                    formData.append('variant_data', JSON.stringify(variantData));

                    // Add variant images (only new local images, not existing URLs)
                    existingVariants.forEach((variant) => {
                        if (variant.imageUri && !variant.imageUri.startsWith('http')) {
                            const filename = variant.imageUri.split('/').pop() || `variant-${variant.id}.jpg`;
                            const match = /\.(\w+)$/.exec(filename);
                            const type = match ? `image/${match[1]}` : 'image/jpeg';

                            formData.append('files', {
                                uri: variant.imageUri,
                                name: filename,
                                type,
                            } as any);
                        }
                    });

                    await productApiClient.put('/update-variants', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                }

                // 4. Add NEW variants (those with temporary IDs)
                if (hasVariants && newVariants.length > 0) {
                    const newVariantPayload = {
                        variants: newVariants.map(variant => ({
                            stock: variant.stock,
                            price: variant.price
                        }))
                    };

                    const response = await productApiClient.post(
                        `/add-product-variants/${productId}`,
                        newVariantPayload
                    );

                    const createdVariants = response.data.variants || [];

                    // Upload images for newly created variants
                    for (let i = 0; i < newVariants.length; i++) {
                        const variant = newVariants[i];
                        const createdVariant = createdVariants[i];

                        if (variant.imageUri && !variant.imageUri.startsWith('http') && createdVariant?.id) {
                            const formData = new FormData();
                            const filename = variant.imageUri.split('/').pop() || 'variant-image.jpg';
                            const match = /\.(\w+)$/.exec(filename);
                            const type = match ? `image/${match[1]}` : 'image/jpeg';

                            formData.append('image', {
                                uri: variant.imageUri,
                                name: filename,
                                type,
                            } as any);

                            await productApiClient.post(
                                `/add-variant-image/${createdVariant.id}`,
                                formData,
                                {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                }
                            );
                        }
                    }
                }

                // 5. Upload new product images
                const newImages = imageUris.filter(uri => !existingImageUrls.includes(uri));
                if (newImages.length > 0) {
                    const formData = new FormData();
                    for (const uri of newImages) {
                        const filename = uri.split('/').pop() || 'image.jpg';
                        const match = /\.(\w+)$/.exec(filename);
                        const type = match ? `image/${match[1]}` : 'image/jpeg';

                        formData.append('images', {
                            uri,
                            name: filename,
                            type,
                        } as any);
                    }

                    await productApiClient.post(`/add-images/${productId}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                }

                queryClient.invalidateQueries({
                    queryKey: ['seller-products'],
                });

                showToast('Product updated successfully!', 'success');

            } else {
                // ============================================
                // CREATE NEW PRODUCT
                // ============================================

                const productPayload = {
                    product: {
                        product_name: productName.trim(),
                        description: productDescription.trim(),
                        base_price: Number(productPrice),
                        stock: hasVariants ? 0 : productQuantity,
                        has_variants: hasVariants,
                        category_id: categoryMap[productCategory] || 1,
                    },
                    variant_categories: hasVariants ? variantCategories.map(cat => ({
                        category_name: cat.name,
                        attributes: cat.values.map(value => ({ value }))
                    })) : [],
                    variants: hasVariants ? variants.map(variant => ({
                        stock: variant.stock,
                        price: variant.price
                    })) : []
                };

                // 1. Create product
                const response = await productApiClient.post('/add-product', productPayload);
                const newProductId = response.data.product.id;
                const createdVariants = response.data.variants || [];

                // 2. Upload product images
                if (imageUris.length > 0) {
                    const formData = new FormData();
                    for (const uri of imageUris) {
                        const filename = uri.split('/').pop() || 'image.jpg';
                        const match = /\.(\w+)$/.exec(filename);
                        const type = match ? `image/${match[1]}` : 'image/jpeg';

                        formData.append('images', {
                            uri,
                            name: filename,
                            type,
                        } as any);
                    }

                    await productApiClient.post(`/add-images/${newProductId}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                }

                // 3. Upload variant images
                if (hasVariants && variants.length > 0) {
                    for (let i = 0; i < variants.length; i++) {
                        const variant = variants[i];
                        const createdVariant = createdVariants[i];

                        if (variant.imageUri && !variant.imageUri.startsWith('http') && createdVariant?.id) {
                            const formData = new FormData();
                            const filename = variant.imageUri.split('/').pop() || 'variant-image.jpg';
                            const match = /\.(\w+)$/.exec(filename);
                            const type = match ? `image/${match[1]}` : 'image/jpeg';

                            formData.append('image', {
                                uri: variant.imageUri,
                                name: filename,
                                type,
                            } as any);

                            await productApiClient.post(
                                `/add-variant-image/${createdVariant.id}`,
                                formData,
                                {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                }
                            );
                        }
                    }
                }

                queryClient.invalidateQueries({
                    queryKey: ['seller-products'],
                });

                showToast('Product added successfully!', 'success');
            }

            router.back();
        } catch (error) {
            console.error('Failed to save product:', error);
            showToast('Failed to save product. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (text: string) => {
        const MAX_QUANTITY = 9999;

        const numericValue = text.replace(/[^0-9]/g, '');

        if (numericValue === '') {
            setProductQuantity(0);
            return;
        }

        const quantity = parseInt(numericValue, 10);

        if (isNaN(quantity)) {
            setProductQuantity(0);
        } else if (quantity > MAX_QUANTITY) {
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