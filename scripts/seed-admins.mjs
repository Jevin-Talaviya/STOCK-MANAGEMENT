/**
 * Seed script: Clears all existing Admins & Items, then creates 4 new admin users.
 * 
 * Usage:
 *   node scripts/seed-admins.mjs
 * 
 * Requires MONGODB_URI in .env
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  location: { type: String, required: true, enum: ["kim", "kosamba"], lowercase: true, trim: true },
}, { timestamps: true });

const ItemSchema = new mongoose.Schema({
  machineName: String,
  sapCode: String,
  materialDescription: String,
  storeLocation: String,
  location: String,
  images: [String],
}, { timestamps: true });

const ADMINS = [
  // Kosamba users
  { email: "kosamba.maintenance01@rayzon.com", password: "Kosamba@01", location: "kosamba" },
  { email: "kosamba.maintenance02@rayzon.com", password: "Kosamba@02", location: "kosamba" },
  // Kim users
  { email: "kim.maintenance01@rayzon.com", password: "Kim@01", location: "kim" },
  { email: "kim.maintenance02@rayzon.com", password: "Kim@02", location: "kim" },
];

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI not found in .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB.\n");

    const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
    const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);

    // --- Step 1: Clear old data ---
    const deletedAdmins = await Admin.deleteMany({});
    console.log(`🗑️  Deleted ${deletedAdmins.deletedCount} existing admin(s).`);

    const deletedItems = await Item.deleteMany({});
    console.log(`🗑️  Deleted ${deletedItems.deletedCount} existing item(s).\n`);

    // --- Step 2: Create new admin users ---
    console.log("Creating new admin users...\n");

    for (const admin of ADMINS) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(admin.password, salt);

      await Admin.create({
        email: admin.email,
        passwordHash,
        location: admin.location,
      });

      console.log(`  ✅ ${admin.email} → location: ${admin.location}`);
    }

    console.log("\n🎉 Seeding complete! 4 admin users created.\n");
    console.log("Login credentials:");
    console.log("─".repeat(60));
    console.log("KOSAMBA:");
    console.log("  kosamba.maintenance01@rayzon.com  /  Kosamba@01");
    console.log("  kosamba.maintenance02@rayzon.com  /  Kosamba@02");
    console.log("KIM:");
    console.log("  kim.maintenance01@rayzon.com     /  Kim@01");
    console.log("  kim.maintenance02@rayzon.com     /  Kim@02");
    console.log("─".repeat(60));

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB.");
  }
}

main();
