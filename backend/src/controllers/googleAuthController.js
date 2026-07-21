const { signToken } = require("../utils/jwt");

function getFrontendUrl() {
  const frontendUrl =
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000";

  return frontendUrl.replace(/\/$/, "");
}

function googleLoginSuccess(req, res) {
  try {
    if (!req.user) {
      return res.redirect(
        `${getFrontendUrl()}/login?google_error=authentication_failed`
      );
    }

    const token = signToken(req.user);

    /*
     * The token is placed in the URL fragment instead of the query string.
     * URL fragments are not sent to the frontend server in HTTP requests.
     */
    const redirectUrl =
      `${getFrontendUrl()}/auth/google/callback` +
      `#token=${encodeURIComponent(token)}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google login callback error:", error);

    return res.redirect(
      `${getFrontendUrl()}/login?google_error=callback_failed`
    );
  }
}

function googleLoginFailure(req, res) {
  return res.redirect(
    `${getFrontendUrl()}/login?google_error=authentication_failed`
  );
}

module.exports = {
  googleLoginSuccess,
  googleLoginFailure,
};
