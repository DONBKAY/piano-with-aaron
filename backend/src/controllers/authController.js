const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");
const { sendPasswordResetEmail } = require("../services/emailService");

const SALT_ROUNDS = 12;

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function validatePassword(password) {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (password.length > 128) {
    return "Password must not exceed 128 characters";
  }

  return null;
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({
        error: "Name must be at least 2 characters",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        error: "Name must not exceed 100 characters",
      });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        error: passwordError,
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: "STUDENT",
      },
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "Student account created successfully",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      error: "Unable to create account",
    });
  }
}

async function createAdmin(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({
        error: "Name must be at least 2 characters",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        error: "Name must not exceed 100 characters",
      });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        error: passwordError,
      });
    }

    if (
      typeof confirmPassword === "string" &&
      password !== confirmPassword
    ) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      message: "Administrator account created successfully",
      user: admin,
    });
  } catch (error) {
    console.error("Create admin error:", error);

    return res.status(500).json({
      error: "Unable to create administrator account",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "Unable to log in",
    });
  }
}

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      error: "Unable to load profile",
    });
  }
}

async function updateProfile(req, res) {
  try {
    const { name } = req.body;

    const cleanName = name?.trim();

    if (!cleanName) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({
        error: "Name must be at least 2 characters",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        error: "Name must not exceed 100 characters",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: cleanName,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      error: "Unable to update profile",
    });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        error: passwordError.replace("Password", "New password"),
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        error: "New password must be different from the current password",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const currentPasswordIsValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!currentPasswordIsValid) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        passwordHash,
      },
    });

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      error: "Unable to change password",
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const expiryMinutes = Number(
      process.env.RESET_TOKEN_EXPIRY_MINUTES || 30
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(
          Date.now() + expiryMinutes * 60 * 1000
        ),
      },
    });

    const clientUrl =
      process.env.CLIENT_URL || "http://localhost:3000";

    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    const payload = {
      message: "If that email exists, a reset link has been sent.",
    };

    if (process.env.NODE_ENV !== "production") {
      payload.devResetToken = resetToken;
    }

    return res.json(payload);
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      error: "Unable to process password reset request",
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Token and new password are required",
      });
    }

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return res.status(400).json({
        error: passwordError,
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
      });
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      SALT_ROUNDS
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.json({
      message: "Password updated. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      error: "Unable to reset password",
    });
  }
}

module.exports = {
  signup,
  createAdmin,
  login,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
