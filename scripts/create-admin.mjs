import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load env variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Error: ADMIN_EMAIL or ADMIN_PASSWORD is not defined in environment variables");
  process.exit(1);
}

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function main() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = ADMIN_EMAIL.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

    console.log(`Upserting admin account for email: ${email}...`);
    
    const result = await Admin.findOneAndUpdate(
      { email },
      { email, passwordHash },
      { upsert: true, new: true, runValidators: true }
    );

    console.log("Admin account upserted successfully:", result.email);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

main();
