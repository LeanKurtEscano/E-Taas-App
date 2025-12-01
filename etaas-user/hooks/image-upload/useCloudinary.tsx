
const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
;

const useCloudinary = () => {
  const uploadImageToCloudinary = async (uri: string, folder: string = 'uploads'): Promise<string> => {
    try {
      const formData = new FormData();
      const fileExtension = uri.split('.').pop() || 'jpg';
      const fileName = `upload_${Date.now()}.${fileExtension}`;

      formData.append('file', {
        uri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);

      formData.append('upload_preset', uploadPreset || '');
      formData.append('folder', folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
     
      throw error;
    }
  };

  return { uploadImageToCloudinary };
};

export default useCloudinary;



