import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import db from "../db.js";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

dotenv.config();
const router = express.Router();

const SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// 🔐 Register Endpoint
router.post("/register", async (req, res) => {
    console.log('[Auth][register] Request body:', req.body);
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
            [email, hashedPassword, role]
        );
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Email already exists" });
        }
        console.error(err);
        res.status(500).json({ message: "Registration failed" });
    }
});

// 🔑 Login Endpoint
router.post("/login", async (req, res) => {
    console.log('[Auth][login] Request body:', req.body);
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });
        console.log(`[Auth][login] User authenticated jwt token: ${email}, Role: ${user.role}`);
        const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: "1h" });

        console.log(`[Auth][login] User logged in: ${email}, Role: ${user.role}`);
        console.log(`[Auth][login] Generated JWT token: ${token}`);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
});

export default router;

// --- Password Reset Endpoints ---
// POST /api/forgot-password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    try {
        // Check if user exists
        const [rows] = await db.execute("SELECT id, email FROM users WHERE email = ?", [email]);
        if (rows.length === 0) return res.status(404).json({ message: "Email not found" });

        // Generate secure token
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 1 hour expiry

        // Save token to DB (upsert)
        await db.execute(
            `INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)`,
            [email, token, expires]
        );

        // Send email with reset link
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@vaidhisadhanabhakti.cloud';
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort) || 465,
            secure: true,
            auth: { user: smtpUser, pass: smtpPass },
        });
        let baseUrl = process.env.DOMAIN || 'http://localhost:3000';
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;
                // Prepare HTML email with logo (like OTP)
                const logoPath = path.resolve('uploads/public-data/VSB-logo.png');
                const logoCid = 'vsb-info@vaidhisadhanabhakti.cloud';
                const logoExists = fs.existsSync(logoPath);
                const htmlBody = `
                    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f7fb; padding: 24px; margin: 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eceef4;">
                            <tr>
                                <td style="padding: 28px 28px 16px 28px; text-align: center; background: #fff9ef;">
                                    ${logoExists
                                        ? `<img src=\"cid:${logoCid}\" alt=\"Vaidhi Sadhana Bhakti\" style=\"max-width: 240px; height: auto; display: inline-block;\" />`
                                        : `<h2 style=\"margin: 0; color: #5a2d0c; font-size: 26px; letter-spacing: 0.5px;\">VAIDHI SADHANA BHAKTI</h2>`}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 28px; color: #222222;">
                                    <h2 style="margin: 0 0 12px 0; font-size: 24px; color: #1f2a44;">Password Reset Request</h2>
                                    <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                                        You requested a password reset. Click the button below to reset your password.<br>This link is valid for <strong>10 minutes</strong>.
                                    </p>
                                    <div style="margin: 0 0 18px 0; text-align: center;">
                                        <a href="${resetUrl}" style="display: inline-block; font-size: 18px; font-weight: 700; color: #fff; background: #5a2d0c; border-radius: 8px; padding: 12px 24px; text-decoration: none;">Reset Password</a>
                                    </div>
                                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #718096;">
                                        If you did not request this, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 16px 28px 24px 28px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #edf2f7;">
                                    © ${new Date().getFullYear()} Vaidhi Sadhana Bhakti. All rights reserved.
                                </td>
                            </tr>
                        </table>
                    </div>
                `;
                const mailOptions = {
                    from: fromEmail,
                    to: email,
                    subject: 'Password Reset Request',
                    html: htmlBody,
                };
                if (logoExists) {
                    mailOptions.attachments = [
                        {
                            filename: 'VSB-logo.png',
                            path: logoPath,
                            cid: logoCid,
                        },
                    ];
                }
                await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset link sent to email" });
    } catch (err) {
        console.error("[Forgot Password] Error:", err);
        res.status(500).json({ message: "Failed to send reset email" });
    }
});

// POST /api/reset-password
router.post("/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and new password are required" });
    try {
        // Find token
        const [rows] = await db.execute(
            "SELECT email, expires_at FROM password_resets WHERE token = ?",
            [token]
        );
        if (rows.length === 0) return res.status(400).json({ message: "Invalid or expired token" });
        const { email, expires_at } = rows[0];
        if (new Date(expires_at) < new Date()) {
            return res.status(400).json({ message: "Token expired" });
        }
        // Hash new password
        const hashed = await bcrypt.hash(password, 10);
        await db.execute("UPDATE users SET password = ? WHERE email = ?", [hashed, email]);
        // Delete used token
        await db.execute("DELETE FROM password_resets WHERE token = ?", [token]);
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("[Reset Password] Error:", err);
        res.status(500).json({ message: "Failed to reset password" });
    }
});
