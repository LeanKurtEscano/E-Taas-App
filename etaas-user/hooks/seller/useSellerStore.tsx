
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

        return unsubscribe; // Call this to stop listening
    };


    const addProduct = async (
        product: Omit<Product, 'id' | 'createdAt'>,
        imageUris: string[]
    ): Promise<string> => {
        try {

            const uploadedImageUrls = await uploadMultipleImages(imageUris);


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

            if (imagesToDelete && imagesToDelete.length > 0) {
                console.log('Deleting images from Cloudinary:', imagesToDelete);

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
                        // Continue even if one image fails to delete
                    }
                });

                await Promise.all(deletePromises);
            }

            // Step 2: Upload new images to Cloudinary
            let uploadedImageUrls: string[] = [];
            if (newImageUris && newImageUris.length > 0) {
                console.log('Uploading new images:', newImageUris.length);
                uploadedImageUrls = await uploadMultipleImages(newImageUris);
            }

            // Step 3: Combine existing images (that weren't deleted) with newly uploaded images
            const finalImageUrls = [
                ...(existingImages || []),
                ...uploadedImageUrls
            ];

           
            if (imagesToDelete?.length || newImageUris?.length) {
                updateData.images = finalImageUrls;
            }
            // Step 4: Update Firestore document
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