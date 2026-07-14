import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
     async authorize(credentials) {
  console.log("[NextAuth] authorize called with email:", credentials?.email);

  if (!credentials?.email || !credentials?.password) {
    console.log("[NextAuth] Missing credentials");
    return null;
  }

  // Step 1: Connect to MongoDB
  let db;
  try {
    db = await connectToDatabase();
    console.log("[NextAuth] MongoDB connected successfully");
  } catch (err) {
    console.error("[NextAuth] MongoDB connection FAILED:", err.message);
    throw new Error("Database connection failed. Please try again later.");
  }

  // Step 2: Find admin user
  let admin;
  try {
    admin = await Admin.findOne({
      email: credentials.email.toLowerCase().trim(),
    });
    console.log("[NextAuth] Admin lookup result:", admin ? `found (${admin.email})` : "NOT FOUND");
  } catch (err) {
    console.error("[NextAuth] Admin query FAILED:", err.message);
    throw new Error("Database query failed. Please try again later.");
  }

  if (!admin) {
    return null;
  }

  // Step 3: Verify password
  let isValid;
  try {
    console.log("[NextAuth] Hash prefix:", admin.passwordHash?.substring(0, 7));
    isValid = await bcrypt.compare(
      credentials.password,
      admin.passwordHash
    );
    console.log("[NextAuth] Password match:", isValid);
  } catch (err) {
    console.error("[NextAuth] bcrypt.compare FAILED:", err.message);
    throw new Error("Password verification failed. Please try again later.");
  }

  if (!isValid) {
    return null;
  }

  return {
    id: admin._id.toString(),
    email: admin.email,
  };
}
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
