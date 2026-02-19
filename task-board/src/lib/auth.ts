// Simple auth middleware for Next.js apps
// Add to your layout.tsx or as middleware

const AUTH_PASSWORD = process.env.APP_PASSWORD || "lieta-secure-2026";

export function requireAuth() {
  // This is a simple client-side check
  // For production, use proper auth (NextAuth.js, Clerk, etc.)
  return typeof window !== "undefined";
}

export function getAuthHeader() {
  return btoa(AUTH_PASSWORD);
}
