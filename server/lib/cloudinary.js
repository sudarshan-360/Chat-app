// server/lib/cloudinary.js
import cloudinary from "cloudinary";

let isConfigured = false;

const ensureConfigured = () => {
  if (!isConfigured) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    
    // Debug logging
    console.log('Cloudinary Config Check:');
    console.log('CLOUD_NAME:', CLOUDINARY_CLOUD_NAME ? 'Loaded' : 'Missing');
    console.log('API_KEY:', CLOUDINARY_API_KEY ? 'Loaded' : 'Missing');
    console.log('API_SECRET:', CLOUDINARY_API_SECRET ? 'Loaded' : 'Missing');
    
    cloudinary.v2.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    
    isConfigured = true;
  }
};

export const uploadImageFromData = async (dataUrl, folder = "quickchat") => {
  // dataUrl: base64 or data URL
  try {
    ensureConfigured(); // Ensure Cloudinary is configured before upload
    const result = await cloudinary.v2.uploader.upload(dataUrl, {
      folder,
      resource_type: "image",
      overwrite: true,
    });
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    throw err;
  }
};

export const deleteImageFromUrl = async (imageUrl) => {
  try {
    ensureConfigured();
    
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileWithExtension.split('.')[0];
    
    // Find folder path (everything after 'upload/v{version}/')
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
      const folderParts = urlParts.slice(uploadIndex + 2, -1);
      const fullPublicId = folderParts.length > 0 ? `${folderParts.join('/')}/${publicId}` : publicId;
      
      const result = await cloudinary.v2.uploader.destroy(fullPublicId);
      return result;
    }
    
    throw new Error('Invalid Cloudinary URL format');
  } catch (err) {
    console.error("Cloudinary delete failed:", err);
    // Don't throw error - we don't want message deletion to fail if image deletion fails
    return { result: 'error', error: err.message };
  }
};

export default cloudinary.v2;
