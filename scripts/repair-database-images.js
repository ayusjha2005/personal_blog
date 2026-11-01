require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const Article = require('../src/models/Article');
const Profile = require('../src/models/Profile');
const cloudinaryConfig = require('../src/config/cloudinary');

const PUBLIC_DIR = path.join(__dirname, '../public');

// Category to bundled image map for intelligent fallback
const CATEGORY_IMAGE_MAP = {
  'Web Development': '/images/article-fullstack.jpg',
  'DSA & Algorithms': '/images/article-dsa.jpg',
  'Linux & Tools': '/images/article-linux.jpg',
  'Projects & Hackathons': '/images/article-roadmap.jpg',
  'Career & Internships': '/images/article-roadmap.jpg',
  'College Life': '/images/article-college.jpg',
  'Personal': '/images/article-productivity.jpg',
};

async function repairDatabaseImages() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_personal_blog';
  console.log(`[Image Repair] Connecting to MongoDB: ${mongoURI.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    await mongoose.connect(mongoURI);
    console.log('[Image Repair] Connected successfully.');

    const hasCloudinary = cloudinaryConfig.isConfigured();
    console.log(`[Image Repair] Cloudinary configured: ${hasCloudinary ? 'YES' : 'NO'}`);

    // Helper to upload a local bundled file to Cloudinary if configured
    async function uploadBundledToCloudinary(relativePath, folder) {
      if (!hasCloudinary) return null;
      const fullPath = path.join(PUBLIC_DIR, relativePath.replace(/^\//, ''));
      if (!fs.existsSync(fullPath)) return null;

      try {
        const buffer = await fs.promises.readFile(fullPath);
        const result = await cloudinaryConfig.uploadBuffer(buffer, { folder });
        console.log(`[Image Repair] Uploaded ${relativePath} to Cloudinary: ${result.secure_url}`);
        return result;
      } catch (err) {
        console.error(`[Image Repair] Cloudinary upload failed for ${relativePath}:`, err.message);
        return null;
      }
    }

    // 1. Repair Articles
    const articles = await Article.find();
    console.log(`[Image Repair] Checking ${articles.length} articles...`);

    let repairedArticles = 0;
    for (const article of articles) {
      const cover = article.coverImage || '';
      let isBroken = false;

      // Check if coverImage is missing, points to non-existent hero-desktop.jpg, or is an ephemeral /uploads/ path that doesn't exist on disk
      if (!cover || cover === '/images/hero-desktop.jpg') {
        isBroken = true;
      } else if (cover.startsWith('/uploads/')) {
        const fullLocalPath = path.join(PUBLIC_DIR, cover.replace(/^\//, ''));
        if (!fs.existsSync(fullLocalPath)) {
          isBroken = true;
        }
      }

      if (isBroken) {
        console.log(`[Image Repair] Found broken cover for article "${article.title}": "${cover}"`);
        const fallbackRel = CATEGORY_IMAGE_MAP[article.category] || '/images/article-productivity.jpg';

        if (hasCloudinary) {
          const uploaded = await uploadBundledToCloudinary(fallbackRel, 'personal-blog/articles');
          if (uploaded) {
            article.coverImage = uploaded.secure_url;
            article.coverImagePublicId = uploaded.public_id;
          } else {
            article.coverImage = fallbackRel;
            article.coverImagePublicId = null;
          }
        } else {
          article.coverImage = fallbackRel;
          article.coverImagePublicId = null;
        }

        await article.save();
        repairedArticles++;
        console.log(`[Image Repair] Repaired article "${article.title}" -> ${article.coverImage}`);
      }
    }

    // 2. Repair Profile
    const profile = await Profile.findOne();
    if (profile) {
      const profileImg = profile.profileImage || '';
      let isProfileBroken = false;

      if (!profileImg) {
        isProfileBroken = true;
      } else if (profileImg.startsWith('/uploads/')) {
        const fullLocalPath = path.join(PUBLIC_DIR, profileImg.replace(/^\//, ''));
        if (!fs.existsSync(fullLocalPath)) {
          isProfileBroken = true;
        }
      }

      if (isProfileBroken) {
        console.log(`[Image Repair] Found broken profile image: "${profileImg}"`);
        const fallbackProfile = '/images/profile.jpg';

        if (hasCloudinary) {
          const uploaded = await uploadBundledToCloudinary(fallbackProfile, 'personal-blog/profile');
          if (uploaded) {
            profile.profileImage = uploaded.secure_url;
            profile.profileImagePublicId = uploaded.public_id;
          } else {
            profile.profileImage = fallbackProfile;
            profile.profileImagePublicId = null;
          }
        } else {
          profile.profileImage = fallbackProfile;
          profile.profileImagePublicId = null;
        }

        await profile.save();
        console.log(`[Image Repair] Repaired profile photo -> ${profile.profileImage}`);
      } else {
        console.log(`[Image Repair] Profile photo is valid: ${profileImg}`);
      }
    }

    console.log(`\n[Image Repair Summary] Finished! Repaired ${repairedArticles} articles.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Image Repair Error]:', err);
    process.exit(1);
  }
}

repairDatabaseImages();
