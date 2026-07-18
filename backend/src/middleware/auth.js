const { verifyToken } = require("../utils/jwt");

// Verifies the JWT and attaches the decoded user to req.user
function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid authorization header",
    });
  }

  const token = header.split(" ")[1];

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

// Restricts a route to one or more roles
function requireRole(...allowedRoles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication is required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "You do not have permission to perform this action",
      });
    }

    return next();
  };
}

// Convenience middleware for admin-only routes
const requireAdmin = requireRole("ADMIN");

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
};
