import { getToken } from "next-auth/jwt";

/**
 * Extracts the admin's location from the JWT token in the request.
 * Returns the location string ("kim" or "kosamba") or null if not authenticated.
 * @param {Request} request
 * @returns {Promise<string|null>}
 */
export async function getAdminLocation(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || !token.location) {
    return null;
  }

  return token.location;
}
