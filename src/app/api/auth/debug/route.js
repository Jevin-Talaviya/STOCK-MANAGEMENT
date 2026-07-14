import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check auth infrastructure health.
 * DELETE THIS ROUTE AFTER DEBUGGING.
 */
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    env: {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "(not set - using Vercel auto-detect)",
      MONGODB_URI: process.env.MONGODB_URI
        ? `${process.env.MONGODB_URI.substring(0, 20)}...` 
        : "(NOT SET!)",
    },
    mongoConnection: null,
    adminCount: null,
    adminEmails: null,
    bcryptTest: null,
    errors: [],
  };

  // 1. Test MongoDB Connection
  try {
    await connectToDatabase();
    checks.mongoConnection = "SUCCESS";
  } catch (err) {
    checks.mongoConnection = "FAILED";
    checks.errors.push(`MongoDB: ${err.message}`);
    return NextResponse.json(checks, { status: 500 });
  }

  // 2. Check Admin collection
  try {
    const admins = await Admin.find({}, { email: 1, _id: 0 }).lean();
    checks.adminCount = admins.length;
    checks.adminEmails = admins.map((a) => a.email);
  } catch (err) {
    checks.errors.push(`Admin query: ${err.message}`);
  }

  // 3. Test bcrypt import
  try {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("test", 10);
    const match = await bcrypt.compare("test", hash);
    checks.bcryptTest = match ? "SUCCESS" : "FAILED (compare returned false)";
  } catch (err) {
    checks.bcryptTest = "FAILED";
    checks.errors.push(`bcrypt: ${err.message}`);
  }

  return NextResponse.json(checks, { status: checks.errors.length > 0 ? 500 : 200 });
}
