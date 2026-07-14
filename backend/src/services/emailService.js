const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // SMTP not configured — caller should handle this gracefully
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

// Never throws — a failed email should never break the signup/login/reset flow.
// Logs the error and lets the caller decide what (if anything) to tell the user.
async function sendPasswordResetEmail(toEmail, resetUrl) {
  const t = getTransporter();
  if (!t) {
    console.warn("Email not sent: SMTP is not configured.");
    return { sent: false };
  }

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@pianowithaaron.com",
      to: toEmail,
      subject: "Reset your Piano with Aaron password",
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1a1a1a;">Reset your password</h2>
          <p style="color: #444;">
            We received a request to reset your Piano with Aaron password.
            Click the button below to choose a new one. This link expires in
            ${process.env.RESET_TOKEN_EXPIRY_MINUTES || 30} minutes.
          </p>
          <a href="${resetUrl}"
             style="display: inline-block; margin: 16px 0; padding: 12px 24px;
                    background: #c8a24a; color: #1a1a1a; text-decoration: none;
                    border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.error("Failed to send password reset email:", err.message);
    return { sent: false };
  }
}

module.exports = { sendPasswordResetEmail };
