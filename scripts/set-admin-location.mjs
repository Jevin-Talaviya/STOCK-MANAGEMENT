/**
 * Script to set the `location` field on existing Admin documents.
 * 
 * Usage:
 *   node scripts/set-admin-location.mjs <email> <location>
 * 
 * Example:
 *   node scripts/set-admin-location.mjs admin@example.com kim
 *   node scripts/set-admin-location.mjs admin2@example.com kosamba
 * 
 * Requires MONGODB_URI in .env or as environment variable.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const VALID_LOCATIONS = ["kim", "kosamba"];

const AdminSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  location: String,
}, { timestamps: true });

async function main() {
  const [email, location] = process.argv.slice(2);

  if (!email || !location) {
    console.error("Usage: node scripts/set-admin-location.mjs <email> <location>");
    console.error("  Locations: kim, kosamba");
    process.exit(1);
  }

  if (!VALID_LOCATIONS.includes(location.toLowerCase())) {
    console.error(`Invalid location: "${location}". Must be one of: ${VALID_LOCATIONS.join(", ")}`);
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI not found in environment or .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

    const result = await Admin.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { location: location.toLowerCase().trim() },
      { new: true }
    );

    if (!result) {
      console.error(`Admin with email "${email}" not found.`);
      process.exit(1);
    }

    console.log(`✅ Updated admin "${result.email}" → location: "${result.location}"`);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
