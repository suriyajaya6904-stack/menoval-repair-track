/**
 * Migration Script: Migrate existing repair-only data to the new multi-business schema.
 * 
 * WHAT IT DOES:
 * 1. Adds businessType='repair' to all existing shops
 * 2. Copies legacy device fields into itemDetails for all existing jobs
 * 3. Sets businessType='repair' on all existing jobs
 * 
 * SAFE TO RUN: This is additive-only (adds fields, never removes).
 * Can be run multiple times safely (idempotent).
 * 
 * Usage: node migrate_to_multi_business.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Shop = require('./models/Shop');
const Job = require('./models/Job');

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
  console.log(' Starting migration to multi-business schema...\n');

  await mongoose.connect(MONGO_URI);
  console.log(' Connected to MongoDB\n');

  // 1. Migrate Shops — add businessType='repair' where missing
  const shopResult = await Shop.updateMany(
    { businessType: { $exists: false } },
    { $set: { businessType: 'repair' } }
  );
  console.log(` Shops updated: ${shopResult.modifiedCount} (added businessType='repair')`);

  // 2. Migrate Jobs — copy legacy fields to itemDetails + set businessType
  const jobsToMigrate = await Job.find({
    businessType: { $exists: false }
  }).select('deviceType brand model color identifier repairCategory reportedIssue deviceCondition technicianDiagnosis technicianNotes partsRequired');

  console.log(` Jobs to migrate: ${jobsToMigrate.length}`);

  let migrated = 0;
  for (const job of jobsToMigrate) {
    const itemDetails = {};
    if (job.deviceType) itemDetails.deviceType = job.deviceType;
    if (job.brand) itemDetails.brand = job.brand;
    if (job.model) itemDetails.model = job.model;
    if (job.color) itemDetails.color = job.color;
    if (job.identifier) itemDetails.identifier = job.identifier;
    if (job.repairCategory) itemDetails.repairCategory = job.repairCategory;
    if (job.reportedIssue?.length) itemDetails.reportedIssue = job.reportedIssue;
    if (job.deviceCondition) itemDetails.deviceCondition = job.deviceCondition;
    if (job.technicianDiagnosis) itemDetails.technicianDiagnosis = job.technicianDiagnosis;
    if (job.partsRequired?.length) itemDetails.partsRequired = job.partsRequired;

    await Job.updateOne(
      { _id: job._id },
      {
        $set: {
          businessType: 'repair',
          itemDetails,
          internalNotes: job.technicianNotes || '',
          tags: job.reportedIssue || [],
          description: job.deviceCondition || ''
        }
      }
    );
    migrated++;
  }
  console.log(` Jobs migrated: ${migrated}`);

  // 3. Verify
  const shopCount = await Shop.countDocuments({ businessType: { $exists: true } });
  const jobCount = await Job.countDocuments({ businessType: { $exists: true } });
  console.log(`\n Verification:`);
  console.log(`   Shops with businessType: ${shopCount}`);
  console.log(`   Jobs with businessType: ${jobCount}`);

  console.log('\n Migration complete! All existing data preserved.\n');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error(' Migration failed:', err);
  process.exit(1);
});
