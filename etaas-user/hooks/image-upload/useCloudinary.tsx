
const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const useCloudinary = () => {


    const uploadToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
      // Create form data
      const formData = new FormData();

      // Get file extension
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `chat_${Date.now()}.${fileExtension}`;

      // Append image file
      formData.append('file', {
        uri: imageUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);

      formData.append('upload_preset', uploadPreset || '');
      formData.append('folder', 'conversations');

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  return {
    uploadToCloudinary
  }
  
}

export default useCloudinary