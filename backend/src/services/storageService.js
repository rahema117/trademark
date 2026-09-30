const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Cloudinary using process.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image file object (with buffer or path) to Cloudinary in 'trademarks' folder.
 * Returns the secure_url string.
 */
const uploadImage = async (file) => {
  if (!file) return '';

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'trademarks',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Error]: Upload failed', error);
            return reject(error);
          }
          console.log('[Cloudinary Success]: Uploaded image to folder trademarks:', result.secure_url);
          resolve(result.secure_url);
        }
      );

      if (file.buffer) {
        uploadStream.end(file.buffer);
      } else if (file.path) {
        fs.createReadStream(file.path).pipe(uploadStream);
      } else {
        reject(new Error('No image buffer or file path found for upload'));
      }
    });
  } else {
    // Fallback for local testing if Cloudinary env vars are missing
    console.warn('[StorageService Warning]: Cloudinary credentials not configured. Saving locally.');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '.png').toLowerCase();
    const filename = `trademark-${uniqueSuffix}${ext}`;
    const fullPath = path.join(uploadsDir, filename);

    if (file.buffer) {
      fs.writeFileSync(fullPath, file.buffer);
    } else if (file.path) {
      fs.copyFileSync(file.path, fullPath);
    }

    return `/uploads/${filename}`;
  }
};

/**
 * Delete a file given its Cloudinary URL or relative disk path
 */
const deleteFile = async (imagePath) => {
  if (!imagePath) return;

  try {
    if (imagePath.includes('res.cloudinary.com')) {
      // Extract public_id (folder/filename without extension)
      const urlParts = imagePath.split('/');
      const filenameWithExt = urlParts.pop();
      const filename = filenameWithExt.split('.')[0];
      const folder = urlParts.pop();
      const publicId = `${folder}/${filename}`;

      await cloudinary.uploader.destroy(publicId);
      console.log(`[StorageService] Deleted Cloudinary image: ${publicId}`);
    } else {
      // Local disk file deletion fallback
      const filename = path.basename(imagePath);
      const fullPath = path.join(uploadsDir, filename);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`[StorageService] Deleted local file: ${fullPath}`);
      }
    }
  } catch (error) {
    console.error(`[StorageService Error]: Failed to delete image ${imagePath}`, error);
  }
};

const getPublicUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `/uploads/${filename}`;
};

module.exports = {
  uploadImage,
  deleteFile,
  getPublicUrl,
};
