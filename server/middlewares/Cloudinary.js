// middlewares/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
// import path from 'path'

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a local file to Cloudinary and deletes it after upload.
 * @param {string} localFilePath - Absolute path to the file on local disk.
 * @returns {Promise<object|null>} - Cloudinary response or null if failed.
 */
export const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // handles images, videos, pdf, etc.
    });

    console.log('✅ File uploaded to Cloudinary:', response);

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};
