
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    onSnapshot
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Product, ShopData } from '@/types/seller/shop';
import { useCurrentUser } from '../useCurrentUser';
const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const apiKey = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;
import { Variant } from '@/types/product/product';
import { deleteField } from 'firebase/firestore';
const useSellerStore = () => {

    const { userData } = useCurrentUser();

    const uploadToCloudinary = async (imageUri: string): Promise<string> => {
        const CLOUDINARY_CLOUD_NAME = cloudName;
        const CLOUDINARY_UPLOAD_PRESET = uploadPreset;

        const formData = new FormData();
        formData.append('file', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'product.jpg',
        } as any);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };


    const uploadMultipleImages = async (imageUris: string[]): Promise<string[]> => {
        const uploadPromises = imageUris.map(uri => uploadToCloudinary(uri));
        return Promise.all(uploadPromises);
    };




    const listenToSellerProducts = (callback: (products: Product[]) => void) => {

        if (!userData?.uid) {
            console.warn('User not loaded yet — skipping Firestore listener');
            return () => { };
        }


        const productsRef = collection(db, 'products');
        const q = query(
            productsRef,
            where('sellerId', '==', userData?.uid),
            orderBy('createdAt', 'desc')
        );

        // Realtime listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const products: Product[] = [];
            snapshot.forEach((doc) => {
                products.push({
                    id: doc.id,
                    ...doc.data(),
                } as Product);
            });
            callback(products);
        });

        return unsubscribe; 
    };


    const addProduct = async (
        product: Omit<Product, 'id' | 'createdAt'>,
        imageUris: string[]
    ): Promise<string> => {
        try {

            const uploadedImageUrls = await uploadMultipleImages(imageUris);

            const variantsWithImages: Variant[] =
                product.variants?.filter(
                    (variant) => variant.image && variant.image.trim() !== ""
                ) || [];



            const getVariantImages =
                variantsWithImages?.length > 0
                    ? variantsWithImages.map((variant) => variant.image!)
                    : [];

            const uploadVariantImageUrls = await uploadMultipleImages(getVariantImages);

            const updatedProduct = { ...product };

            updatedProduct.variants = product.variants?.map((variant) => {
              
                const index = variantsWithImages.findIndex((v) => v.id === variant.id);

               
                if (index !== -1 && uploadVariantImageUrls[index]) {
                    return { ...variant, image: uploadVariantImageUrls[index] };
                }

                
                return variant;
            }) || [];




            const productsRef = collection(db, 'products');
            const docRef = await addDoc(productsRef, {
                ...product,
                images: uploadedImageUrls,
                createdAt: Timestamp.now(),
            });

            return docRef.id;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    };


  const updateProduct = async (
    productId: string,
    updates: Partial<Product>,
    newImageUris?: string[],
    existingImages?: string[],
    imagesToDelete?: string[]
): Promise<void> => {
    try {
        const productRef = doc(db, 'products', productId);

        let updateData: any = { ...updates };

        if (updates.hasVariants === false) {
            updateData.variantCategories = deleteField();
            updateData.variants = deleteField();
        }

        if (imagesToDelete && imagesToDelete.length > 0) {
            const deletePromises = imagesToDelete.map(async (imageUrl) => {
                try {
                    const urlParts = imageUrl.split('/');
                    const uploadIndex = urlParts.indexOf('upload');
                    if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
                        const pathAfterVersion = urlParts.slice(uploadIndex + 2).join('/');
                        const publicId = pathAfterVersion.split('.')[0];
                        console.log('Deleting public_id:', publicId);
                    }
                } catch (error) {
                    console.error('Error deleting Cloudinary image:', imageUrl, error);
                }
            });
            await Promise.all(deletePromises);
        }

     
        let uploadedImageUrls: string[] = [];
        if (newImageUris && newImageUris.length > 0) {
            uploadedImageUrls = await uploadMultipleImages(newImageUris);
        }

        const finalImageUrls = [
            ...(existingImages || []),
            ...uploadedImageUrls
        ];

        if (imagesToDelete?.length || newImageUris?.length) {
            updateData.images = finalImageUrls;
        }

        if (updates.variants && updates.variants.length > 0) {
            const variantsWithLocalImages = updates.variants.filter(
                (variant) => variant.image && !variant.image.startsWith('http')
            );

            if (variantsWithLocalImages.length > 0) {
                const localImageUris = variantsWithLocalImages.map(v => v.image!);
                const uploadedVariantUrls = await uploadMultipleImages(localImageUris);

                updateData.variants = updates.variants.map((variant) => {
                    const index = variantsWithLocalImages.findIndex((v) => v.id === variant.id);
                    if (index !== -1 && uploadedVariantUrls[index]) {
                        return { ...variant, image: uploadedVariantUrls[index] };
                    }
                    return variant;
                });
            }
        }

        await updateDoc(productRef, updateData);
        console.log('Product updated successfully');

    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};




    const deleteProduct = async (productId: string): Promise<void> => {
        try {
            const productRef = doc(db, 'products', productId);
            await deleteDoc(productRef);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    };


    const updateShopInfo = async (
        userId: string,
        updates: Partial<ShopData>,
        coverPhotoUri?: string,
        profilePhotoUri?: string
    ): Promise<void> => {
        try {
            const userRef = doc(db, 'users', userId);

            let updateData: any = { ...updates };


            if (coverPhotoUri) {
                const coverUrl = await uploadToCloudinary(coverPhotoUri);
                updateData.coverPhoto = coverUrl;
            }


            if (profilePhotoUri) {
                const profileUrl = await uploadToCloudinary(profilePhotoUri);
                updateData.profilePhoto = profileUrl;
            }

            await updateDoc(userRef, {
                'sellerInfo': updateData,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error('Error updating shop info:', error);
            throw error;
        }
    };

    return {
        listenToSellerProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateShopInfo,
        uploadToCloudinary,
        uploadMultipleImages
    }
}

export default useSellerStore