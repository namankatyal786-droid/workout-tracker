// requireAuth: Authentication middleware jo incoming requests ko verify karta hai
// Viva point: REST API security ke liye standard Authorization header (Bearer token/UUID) check karta hai.
export async function requireAuth(req, res, next) {
  try {
    let userId = null;

    // 1. Check 'Authorization: Bearer <userId/token>'
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      userId = authHeader.split(" ")[1]?.trim();
    }

    // 2. Testing fallback: 'x-user-id: <uuid>' header
    if (!userId && req.headers["x-user-id"]) {
      userId = String(req.headers["x-user-id"]).trim();
    }

    // Agar user unauthenticated hai toh 401 Unauthorized return karo
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing Authorization Bearer token or x-user-id header."
      });
    }

    // Request object par user attach kar do taaki downstream controllers ise access kar sakein
    req.user = { id: userId };
    next();
  } catch (error) {
    console.error("[Auth Middleware Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during authentication."
    });
  }
}
