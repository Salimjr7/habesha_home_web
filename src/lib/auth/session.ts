import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AuthenticationError } from "@/lib/errors";

/**
 * Get current authenticated user session in Server Components and Server Actions
 */
export async function getServerSession() {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Require an authenticated user or throw AuthenticationError
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new AuthenticationError("You must be logged in to perform this action");
  }
  return session.user;
}

/**
 * Require a specific role (e.g. OWNER or ADMIN)
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  const userRole = (user as unknown as { role?: string }).role || "RENTER";
  
  if (!allowedRoles.includes(userRole)) {
    const { AuthorizationError } = await import("@/lib/errors");
    throw new AuthorizationError("You do not have permission to access this resource");
  }
  
  return user;
}
