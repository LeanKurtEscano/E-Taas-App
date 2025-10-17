
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
    Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Product, ShopData } from '@/types/seller/shop';
const useSellerStore = () => {
    const uploadToCloudinary = async (imageUri: string): Promise<string> => {
        const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
        const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET';

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


    const fetchSellerProducts = async (sellerId: string): Promise<Product[]> => {
        try {
            const productsRef = collection(db, 'products');
            const q = query(
                productsRef,
                where('sellerId', '==', sellerId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const products: Product[] = [];

            querySnapshot.forEach((doc) => {
                products.push({
                    id: doc.id,
                    ...doc.data(),
                } as Product);
            });

            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
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
        newImageUris?: string[]
    ): Promise<void> => {
        try {
            const productRef = doc(db, 'products', productId);

            let updateData: any = { ...updates };


            if (newImageUris && newImageUris.length > 0) {
                const uploadedImageUrls = await uploadMultipleImages(newImageUris);
                updateData.images = uploadedImageUrls;
            }

            await updateDoc(productRef, updateData);
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
        fetchSellerProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateShopInfo,
        uploadToCloudinary,
        uploadMultipleImages
    }
}

export default useSellerStore