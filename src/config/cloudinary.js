const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
}

/**
 * Checks if Cloudinary is fully configured via environment variables
 * @returns {boolean}
 */
function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET)
  );
}

if (process.env.NODE_ENV === 'production' && !isConfigured()) {
  console.warn(
    '[WARN] Cloudinary is NOT configured. Uploaded images will use local ephemeral storage which does not persist across restarts on Render. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in your Render environment.'
  );
}

/**
 * Uploads a file buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Cloudinary upload options (e.g. folder, resource_type)
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    if (!isConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in environment variables.'
        )
      );
    }

    const defaultOptions = {
      folder: 'personal-blog',
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ],
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(defaultOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve({
        secure_url: result.secure_url,
        public_id: result.public_id,
        bytes: result.bytes,
        format: result.format,
      });
    });

    stream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary by its public_id
 * @param {string} publicId - The Cloudinary public_id
 * @returns {Promise<Object>}
 */
async function deleteImage(publicId) {
  if (!publicId || !isConfigured()) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete asset ${publicId}:`, err.message);
    return null;
  }
}

module.exports = {
  cloudinary,
  isConfigured,
  uploadBuffer,
  deleteImage,
};
