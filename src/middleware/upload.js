const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const cloudinaryConfig = require('../config/cloudinary');

// Ensure the local upload directory exists (used for existing local uploads & dev fallback)
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types and their corresponding extensions
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Memory storage configuration for Vercel and serverless compatibility
const storage = multer.memoryStorage();

// File filter: validate MIME type
function fileFilter(_req, file, cb) {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    const err = new Error(
      `Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WebP.`
    );
    err.code = 'UNSUPPORTED_FILE_TYPE';
    cb(err, false);
  }
}

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Middleware wrapper that handles Multer errors and converts them
 * into user-friendly flash-compatible error messages.
 */
function handleUploadError(fieldName) {
  return function (req, res, next) {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, function (err) {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            req.uploadError = 'File is too large. Maximum size is 5 MB.';
          } else {
            req.uploadError = `Upload error: ${err.message}`;
          }
        } else if (err.code === 'UNSUPPORTED_FILE_TYPE') {
          req.uploadError = err.message;
        } else {
          req.uploadError = 'An unexpected error occurred during upload.';
        }
      }
      next();
    });
  };
}

/**
 * Processes an uploaded file from req.file.
 * If Cloudinary is configured, uploads the buffer to Cloudinary.
 * Otherwise, in local dev, falls back to saving in public/uploads/ without crashing.
 *
 * @param {Object} file - req.file object from multer (contains buffer)
 * @param {string} folder - subfolder or category
 * @returns {Promise<{ url: string, publicId: string|null }>}
 */
async function processImageUpload(file, folder = 'personal-blog') {
  if (!file || !file.buffer) return null;

  if (cloudinaryConfig.isConfigured()) {
    const result = await cloudinaryConfig.uploadBuffer(file.buffer, { folder });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  // Fallback for local development if Cloudinary credentials are not set yet
  const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname).toLowerCase();
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const filename = `${Date.now()}-${uniqueId}${ext}`;
  const localFilePath = path.join(UPLOAD_DIR, filename);

  await fs.promises.writeFile(localFilePath, file.buffer);
  return {
    url: `/uploads/${filename}`,
    publicId: null,
  };
}

/**
 * Safely delete an old image asset.
 * If publicId is provided, deletes from Cloudinary.
 * If it's an old local file in public/uploads/, removes it locally.
 */
async function deleteOldUpload(imagePath, publicId = null) {
  if (publicId && cloudinaryConfig.isConfigured()) {
    try {
      await cloudinaryConfig.deleteImage(publicId);
      return;
    } catch (err) {
      console.error(`[Upload] Failed to delete Cloudinary asset ${publicId}:`, err.message);
    }
  }

  if (imagePath && imagePath.startsWith('/uploads/')) {
    const filename = path.basename(imagePath);
    const fullPath = path.join(UPLOAD_DIR, filename);
    if (fullPath.startsWith(UPLOAD_DIR) && fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error(`[Upload] Failed to delete old local file: ${fullPath}`, err.message);
        }
      });
    }
  }
}

module.exports = {
  handleUploadError,
  processImageUpload,
  deleteOldUpload,
  UPLOAD_DIR,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
};
