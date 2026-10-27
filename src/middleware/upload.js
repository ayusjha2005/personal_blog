/**
 * Image Upload Middleware (Multer)
 *
 * Handles multipart/form-data file uploads for article cover images
 * and profile photographs. Validates file types via MIME, enforces
 * a 5 MB size limit, and generates safe unique filenames.
 *
 * STORAGE NOTE: Files are stored locally in public/uploads/.
 * This will NOT persist on ephemeral hosting platforms (Heroku, Railway,
 * Render free-tier, etc.). To use persistent storage, replace the
 * diskStorage configuration with a cloud-storage engine such as
 * multer-s3, @google-cloud/storage, or Cloudinary.
 */

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure the upload directory exists
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

// Generate a safe, unique filename using crypto random bytes
function generateFilename(originalname, mimetype) {
  const ext = ALLOWED_TYPES[mimetype] || path.extname(originalname).toLowerCase();
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${uniqueId}${ext}`;
}

// Disk storage configuration
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    cb(null, generateFilename(file.originalname, file.mimetype));
  },
});

// File filter: validate actual MIME type
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
 * Safely delete an old uploaded file if it exists within public/uploads/.
 * Does nothing for default placeholder images or external URLs.
 */
function deleteOldUpload(imagePath) {
  if (!imagePath || !imagePath.startsWith('/uploads/')) {
    return; // Not a locally uploaded file — don't touch it
  }

  const filename = path.basename(imagePath);
  const fullPath = path.join(UPLOAD_DIR, filename);

  // Safety: ensure the resolved path is within UPLOAD_DIR
  if (!fullPath.startsWith(UPLOAD_DIR)) {
    return;
  }

  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`[Upload] Failed to delete old file: ${fullPath}`, err.message);
    }
  });
}

module.exports = {
  handleUploadError,
  deleteOldUpload,
  UPLOAD_DIR,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
};
