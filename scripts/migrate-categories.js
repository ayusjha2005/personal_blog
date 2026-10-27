/**
 * Migration script: Convert existing article category ObjectId references
 * to plain category name strings.
 *
 * Run once after deploying the code changes:
 *   node scripts/migrate-categories.js
 *
 * Safe to run multiple times — it only touches articles whose category
 * field is still an ObjectId (not already a string).
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_personal_blog';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const articlesCol = db.collection('articles');
  const categoriesCol = db.collection('categories');

  // 1. Build a lookup map: ObjectId string → category name
  const catDocs = await categoriesCol.find({}).toArray();
  const idToName = {};
  for (const cat of catDocs) {
    idToName[cat._id.toString()] = cat.name;
  }
  console.log(`Found ${catDocs.length} categories in the Category collection:`, Object.values(idToName));

  if (catDocs.length === 0) {
    console.log('No Category documents found – nothing to migrate.');
    console.log('New articles will use the centrally defined category list.');
    await mongoose.disconnect();
    return;
  }

  // 2. Find articles whose category is an ObjectId
  const articles = await articlesCol.find({}).toArray();
  let migrated = 0;
  let skipped = 0;
  let unknownCategory = 0;

  for (const article of articles) {
    // If category is already a string (already migrated), skip
    if (typeof article.category === 'string') {
      skipped++;
      continue;
    }

    // It's an ObjectId — resolve the name
    const catId = article.category.toString();
    const catName = idToName[catId];

    if (!catName) {
      console.warn(`  ⚠ Article "${article.title}" (${article._id}) has unknown category ObjectId: ${catId} — setting to "Personal"`);
      await articlesCol.updateOne(
        { _id: article._id },
        { $set: { category: 'Personal' } }
      );
      unknownCategory++;
      migrated++;
      continue;
    }

    await articlesCol.updateOne(
      { _id: article._id },
      { $set: { category: catName } }
    );
    console.log(`  ✓ Migrated "${article.title}" → category: "${catName}"`);
    migrated++;
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} already up-to-date, ${unknownCategory} set to fallback.`);
  console.log('The Category collection has been left intact (not deleted).');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
