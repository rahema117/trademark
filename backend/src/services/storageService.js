const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Delete a file from disk given its relative URL path (e.g. /uploads/image-123.jpg)
 */
const deleteFile = (imagePath) => {
  if (!imagePath) return;

  try {
    // Extract filename from path like '/uploads/image-123.jpg'
    const filename = path.basename(imagePath);
    const fullPath = path.join(uploadsDir, filename);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`[StorageService] Deleted file: ${fullPath}`);
    }
  } catch (error) {
    console.error(`[StorageService Error]: Failed to delete file ${imagePath}`, error);
  }
};

/**
 * Returns public access URL for uploaded file
 */
const getPublicUrl = (filename) => {
  return `/uploads/${filename}`;
};

module.exports = {
  deleteFile,
  getPublicUrl,
};
