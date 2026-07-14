const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");
const { sendPasswordResetEmail } = require("../services/emailService");

const SALT_ROUNDS = 12;

async function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "STUDENT",
    },
  });

  const token = signToken(user);
  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

// Generates a reset token, emails it to the user via SMTP, and — outside
// production only — also returns the token directly so the flow can still
// be tested locally without a real inbox.
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always return a generic success response so we don't leak which emails exist
  if (!user) {
    return res.json({ message: "If that email exists, a reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiryMinutes = Number(process.env.RESET_TOKEN_EXPIRY_MINUTES || 30);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry: new Date(Date.now() + expiryMinutes * 60 * 1000),
    },
  });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  await sendPasswordResetEmail(user.email, resetUrl);

  const payload = { message: "If that email exists, a reset link has been sent." };
  if (process.env.NODE_ENV !== "production") {
    payload.devResetToken = resetToken; // convenience for local testing only
  }

  return res.json(payload);
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return res.json({ message: "Password updated. You can now log in." });
}

module.exports = { signup, login, me, forgotPassword, resetPassword }; 
