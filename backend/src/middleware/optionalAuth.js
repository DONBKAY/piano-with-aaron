const { verifyToken } = require("../utils/jwt");

// Like requireAuth, but doesn't reject the request if there's no token.
// Used on public routes that behave slightly differently for logged-in users
// (e.g. showing preview vs. full lesson content).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = verifyToken(header.split(" ")[1]);
    } catch (err) {
      // Ignore invalid/expired tokens on optional routes
    }
  }
  next();
}

module.exports = { optionalAuth };
