const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const requiredEnvironmentVariables = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
];

const missingVariables = requiredEnvironmentVariables.filter(
  (variableName) => !process.env[variableName]
);

if (missingVariables.length > 0) {
  console.warn(
    `Google authentication is not fully configured. Missing: ${missingVariables.join(
      ", "
    )}`
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleEmail = profile.emails?.[0]?.value
            ?.trim()
            .toLowerCase();

          if (!googleEmail) {
            return done(
              new Error("Google did not provide an email address."),
              null
            );
          }

          const googleName =
            profile.displayName?.trim() ||
            `${profile.name?.givenName || ""} ${
              profile.name?.familyName || ""
            }`.trim() ||
            "Piano With Aaron Student";

          const profileImageUrl = profile.photos?.[0]?.value || null;

          let user = await prisma.user.findFirst({
            where: {
              OR: [
                {
                  googleId: profile.id,
                },
                {
                  email: googleEmail,
                },
              ],
            },
          });

          if (user) {
            user = await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                googleId: profile.id,
                name: user.name || googleName,
                profileImageUrl:
                  profileImageUrl || user.profileImageUrl || null,
                emailVerifiedAt: user.emailVerifiedAt || new Date(),
              },
            });
          } else {
            user = await prisma.user.create({
              data: {
                name: googleName,
                email: googleEmail,
                googleId: profile.id,
                profileImageUrl,
                emailVerifiedAt: new Date(),
              },
            });
          }

          return done(null, user);
        } catch (error) {
          console.error("Google authentication strategy error:", error);
          return done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
