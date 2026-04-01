/**
 * @swagger
 * /api/download/devotees-xlsx:
 *   get:
 *     summary: Download devotees.xlsx file (admin only)
 *     description: Requires a valid admin JWT. Use the Authorize button with a token from /api/login.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: devotees.xlsx file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Invalid or expired token
 *       403:
 *         description: No token provided or user not admin
 *       404:
 *         description: File not found
 *       500:
 *         description: Failed to download file
 */
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Server]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
/**
 * @swagger
 * /api/devotees:
 *   get:
 *     summary: Get devotees (role-based)
 *     tags: [Devotees]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User email or 'ALL'
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: false
 *         description: Type filter
 *     responses:
 *       200:
 *         description: List of devotees
 *       400:
 *         description: Email is required
 *       500:
 *         description: Failed to fetch devotees
 */
/**
 * @swagger
 * /api/devotee:
 *   get:
 *     summary: Get a single devotee by email
 *     tags: [Devotees]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User email
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: false
 *         description: Type filter
 *     responses:
 *       200:
 *         description: Devotee info
 *       400:
 *         description: Email is required
 *       500:
 *         description: Failed to fetch devotees
 */
/**
 * @swagger
 * /api/devotees:
 *   post:
 *     summary: Add a devotee
 *     tags: [Devotees]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               email:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               # ... other fields ...
 *     responses:
 *       201:
 *         description: Devotee created
 *       500:
 *         description: Failed to create devotee
 */
/**
 * @swagger
 * /api/devotees/{id}:
 *   put:
 *     summary: Update a devotee
 *     tags: [Devotees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Devotee ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               email:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               # ... other fields ...
 *     responses:
 *       200:
 *         description: Devotee updated
 *       500:
 *         description: Failed to update devotee
 */
/**
 * @swagger
 * /api/devotees/{id}:
 *   delete:
 *     summary: Delete a devotee
 *     tags: [Devotees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Devotee ID
 *     responses:
 *       200:
 *         description: Devotee deleted
 *       500:
 *         description: Failed to delete devotee
 */
/**
 * @swagger
 * /api/devotees/bulk:
 *   post:
 *     summary: Bulk upload devotees
 *     tags: [Devotees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               devotees:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Bulk upload successful
 *       400:
 *         description: Invalid data format
 *       500:
 *         description: Bulk upload failed
 */
/**
 * @swagger
 * /api/sadhana/date/{userId}/{date}:
 *   get:
 *     summary: Get sadhana entry by user and date
 *     tags: [Sadhana]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *         required: true
 *         description: Date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Sadhana entry
 */
/**
 * @swagger
 * /api/deployment-test:
 *   get:
 *     summary: Deployment test
 *     tags: [Server]
 *     responses:
 *       200:
 *         description: Backend deployment successful
 */
/**
 * @swagger
 * /api/counsellor/devotees:
 *   get:
 *     summary: Get devotees under a counsellor
 *     tags: [Devotees]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Counsellor's email
 *     responses:
 *       200:
 *         description: List of devotees
 *       400:
 *         description: Missing user_id (email)
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/sadhana/by-email:
 *   get:
 *     summary: Get sadhana entries by user id, month, year, page
 *     tags: [Sadhana]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *         required: true
 *         description: Month (MM)
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         required: true
 *         description: Year (YYYY)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number
 *     responses:
 *       200:
 *         description: Sadhana entries and total pages
 *       400:
 *         description: Missing id, month, or year
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/users/assign-role:
 *   put:
 *     summary: Assign user role
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, counsellor]
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Email and role are required
 *       500:
 *         description: Failed to update role
 */
/**
 * @swagger
 * /api/users/by-email:
 *   get:
 *     summary: Get user by email
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: User email
 *     responses:
 *       200:
 *         description: User info
 *       400:
 *         description: Email is required
 *       500:
 *         description: Failed to fetch user
 */
/**
 * @swagger
 * /api/facilitators:
 *   get:
 *     summary: Get all facilitators (counsellors)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of facilitators
 *       500:
 *         description: Failed to fetch counsellors
 */
/**
 * @swagger
 * /api/devotees/{id}/initiated-name:
 *   get:
 *     summary: Get initiated name by devotee id
 *     tags: [Devotees]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Devotee ID
 *     responses:
 *       200:
 *         description: Initiated name
 *       404:
 *         description: Devotee not found
 *       500:
 *         description: Failed to fetch initiated name
 */
// --- Signup OTP APIs ---
// Use emailjs for backend email sending (node version, not emailjs-com)


/**
 * @swagger
 * /api/check-email-exists:
 *   post:
 *     summary: Check if email exists in users table
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email existence result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   example: true
 */

// ...existing code...
// Swagger setup (must be after app is initialized)
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import nodemailer from 'nodemailer';
  import express from "express";
  import cors from "cors";
  import dotenv from "dotenv";
  import multer from "multer";
  import path from "path";
  import { verifyToken, allowAdmin } from "./middleware/auth.js";
  import authRoutes from "./routes/auth.js";
  import sadhanaRoutes from "./routes/sadhana.js";
  import db from "./db.js";
  import sadhanaCardUploadRoutes from "./routes/sadhanaCardUpload.js";
  import publicDevoteeRoutes from "./routes/publicDevotee.js";
  import notificationRoutes from "./routes/Notification.js";
  import facilitatorRoutes from "./routes/facilitator.js";
  import cashfreeRoutes from  "./routes/cashfree.js";
  import todosRouter from './routes/todos.js';

  // Start monthly email scheduler
  import './monthlyEmailScheduler.js';

  dotenv.config();
  const app = express();
  app.use(express.json());

  
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Devotee Database API',
      version: '1.0.0',
      description: 'API documentation for Devotee Database Backend',
    },
    servers: [
      { url: 'http://localhost:' + (process.env.PORT || 5000) }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js', './server.js'], // Path to the API docs (include server.js)
};


app.post('/api/check-email-exists', cors({ origin: process.env.DOMAIN || 'http://localhost:3000' }), async (req, res) => {
  console.log('[Check Email Exists] Raw request body:', req.body);
  let email = undefined;
  if (req.body && typeof req.body === 'object') {
    if (typeof req.body.email === 'string') {
      email = req.body.email;
      console.log('[Check Email Exists] Extracted email:', email);
    } else {
      console.warn('[Check Email Exists] req.body.email is not a string:', req.body.email);
    }
  } else {
    console.warn('[Check Email Exists] req.body is not an object:', req.body);
  }
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    const exists = rows.length > 0;
    console.log(`[Check Email Exists] Responding with exists:`, exists);
    res.json({ exists });
  } catch (err) {
    console.error('Error checking email existence:', err);
    res.status(500).json({ error: 'Failed to check email', details: err.message });
  }
});

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use("/api", authRoutes);
  app.use("/uploads", express.static("uploads"));
  app.use("/api/sadhana", sadhanaRoutes);
  app.use("/api", sadhanaCardUploadRoutes);
  app.use("/api/devotees", publicDevoteeRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/facilitator", facilitatorRoutes);
  app.use("/api", cashfreeRoutes);
  app.use('/api/todos', todosRouter);


  // Multer setup
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });
  const upload = multer({ storage });


  // Get premium expiry date by email
app.get('/api/users/premium-expiry', async (req, res) => {
  console.log('[Get Premium Expiry] Query params:', req.query);
  const email = req.query.userId;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const [rows] = await db.execute(
      'SELECT premium_expiry_date, user_type FROM users WHERE email = ?',
      [email]
      );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ email, premium_expiry_date: rows[0].premium_expiry_date, user_type: rows[0].user_type });
  } catch (err) {
    console.error('Error fetching premium expiry date:', err);
    res.status(500).json({ error: 'Failed to fetch premium expiry date', details: err.message });
  }
});

  // Send OTP to email using emailjs (node)
  app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    console.log('[SEND-OTP] Request received for email:', email);
    if (!email) {
      console.warn('[SEND-OTP] No email provided in request body');
      return res.status(400).json({ error: 'Email is required' });
    }
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
      console.log('[SEND-OTP] Generated OTP:', otp, 'Expires at:', expiresAt);

      // Save OTP to DB
      await db.execute(
        'INSERT INTO email_otps (email, otp, expires_at, verified) VALUES (?, ?, ?, FALSE)',
        [email, otp, expiresAt]
      );
      console.log('[SEND-OTP] OTP saved to DB for email:', email);

      // Log environment variables for SMTP
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@vaidhisadhanabhakti.cloud';
      console.log('[SEND-OTP] SMTP config:', { smtpHost, smtpPort, smtpUser, fromEmail });

      // Send OTP to email using nodemailer (Hostinger SMTP)
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort) || 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: fromEmail,
        to: email,
        subject: 'Your Signup OTP',
        text: `Your OTP for signup is: ${otp}. It is valid for 10 minutes.`,
      };

      const logoPath = path.resolve('uploads/public-data/VSB-logo.png');
      const logoCid = 'vsb-info@vaidhisadhanabhakti.cloud';
      const logoExists = fs.existsSync(logoPath);

      const htmlBody = `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f7fb; padding: 24px; margin: 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eceef4;">
            <tr>
              <td style="padding: 28px 28px 16px 28px; text-align: center; background: #fff9ef;">
                ${logoExists
                  ? `<img src="cid:${logoCid}" alt="Vaidhi Sadhana Bhakti" style="max-width: 240px; height: auto; display: inline-block;" />`
                  : `<h2 style="margin: 0; color: #5a2d0c; font-size: 26px; letter-spacing: 0.5px;">VAIDHI SADHANA BHAKTI</h2>`}
              </td>
            </tr>
            <tr>
              <td style="padding: 28px; color: #222222;">
                <h2 style="margin: 0 0 12px 0; font-size: 24px; color: #1f2a44;">Your One-Time Password (OTP)</h2>
                <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
                  Use the following OTP to complete your signup. This code is valid for <strong>10 minutes</strong>.
                </p>
                <div style="margin: 0 0 18px 0; text-align: center;">
                  <span style="display: inline-block; font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #2d3748; background: #f7fafc; border: 1px dashed #cbd5e0; border-radius: 10px; padding: 12px 20px;">${otp}</span>
                </div>
                <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #718096;">
                  For your security, do not share this OTP with anyone.
                </p>
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

      mailOptions.html = htmlBody;
      if (logoExists) {
        mailOptions.attachments = [
          {
            filename: 'VSB-logo.png',
            path: logoPath,
            cid: logoCid,
          },
        ];
      }

      console.log('[SEND-OTP] Sending email via nodemailer:', mailOptions);
      await transporter.sendMail(mailOptions);
      console.log('[SEND-OTP] Email sent successfully to:', email);
      res.json({ message: 'OTP sent to email' });
    } catch (err) {
      console.error('[SEND-OTP] Error sending OTP:', err);
      res.status(500).json({ error: 'Failed to send OTP', details: err.message });
    }
    //53B48BRPDQWALW6VUA2PJ1M9 recovery code..
  });
// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  try {
    const [rows] = await db.execute(
      'SELECT * FROM email_otps WHERE email = ? AND otp = ? AND expires_at > NOW() AND verified = FALSE ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );
    if (!rows.length) return res.status(400).json({ error: 'Invalid or expired OTP' });
    await db.execute('UPDATE email_otps SET verified = TRUE WHERE id = ?', [rows[0].id]);
    res.json({ message: 'OTP verified' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ error: 'Failed to verify OTP', details: err.message });
  }
});
// Signup API (after OTP verified)
app.post('/api/signup', async (req, res) => {
  const { email, name, initiated_name, mobile, password } = req.body;
  if (!email || !name || !mobile || !password)
    return res.status(400).json({ error: 'Missing required fields' });
  try {
    // Check OTP verified
    const [otpRows] = await db.execute(
      'SELECT * FROM email_otps WHERE email = ? AND verified = TRUE ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    if (!otpRows.length) return res.status(400).json({ error: 'OTP not verified' });

    // Hash password
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into devotees table (minimal fields for signup)
    const [devoteeResult] = await db.execute(
      'INSERT INTO devotees (first_name, email, initiated_name, mobile_no, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, initiated_name || null, mobile, 'active']
    );


    // Calculate premium_expiry_date (30 days from now)
    const premiumExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Insert into users table with premium_expiry_date
    await db.execute(
    'INSERT INTO users (email, password, role, premium_expiry_date, user_type) VALUES (?, ?, ?, ?, ?)',
    [email, hashedPassword, 'user', premiumExpiryDate, 'trial']
    );

    res.status(201).json({ message: 'Signup successful', devotee_id: devoteeResult.insertId });
  } catch (err) {
    console.error('Error in signup:', err);
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
});



  // Health check
  app.get("/api/health", async (req, res) => res.json({ ok: true }));

  // Get devotees
  app.get("/api/devotees", verifyToken, async (req, res) => {
    console.log("Fetching devotees with query:", req.query);
    const email = req.query.userId;
    const type = req.query.type;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    try {
        if (email === "ALL") {
            // Return all devotees if email is "ALL"
            const [rows] = await db.execute("SELECT * FROM devotees ORDER BY created_at DESC");
            return res.json(rows);
        }
      // Get user role
      const [[user]] = await db.execute("SELECT role FROM users WHERE email = ?", [email]);
      if (!user) return res.status(404).json({ error: "User not found" });
      console.log("role",user.role);
      if (user.role === "user"&& type==="Name") {
        // Show only own devotee profile
        const [rows] = await db.execute("SELECT * FROM devotees WHERE email = ?", [email]);
        return res.json(rows);
      }
      else if (user.role === "counsellor"&& type==="Name") {
          // Show only own devotee profile
          const [rows] = await db.execute("SELECT * FROM devotees WHERE email = ?", [email]);
          return res.json(rows);
      }
      else if (user.role === "counsellor") {
        // Get devotee id for this email
        const [[devotee]] = await db.execute("SELECT id FROM devotees WHERE email = ?", [email]);
        if (!devotee) return res.status(404).json({ error: "Devotee not found" });

        // Get devotees under this counsellor
        const [rows] = await db.execute(
            "SELECT * FROM devotees WHERE facilitator_id = ? ORDER BY created_at DESC",
            [devotee.id]
        );
        return res.json(rows);
      } else if (user.role === "admin") {
        // Admin sees all devotees
        const [rows] = await db.execute("SELECT * FROM devotees ORDER BY created_at DESC");
        return res.json(rows);
      } else {
        // Other roles: restrict as needed
        return res.status(403).json({ error: "Access denied" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch devotees" });
    }
  });

  // Get devotees
  app.get("/api/devotee", verifyToken, async (req, res) => {
    const email = req.query.userId;
    const type = req.query.type;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    try {
      // Get user role
      const [[user]] = await db.execute("SELECT role FROM users WHERE email = ?", [email]);
      if (!user) return res.status(404).json({ error: "User not found" });
      console.log("role:",user.role);

      const [rows] = await db.execute("SELECT * FROM devotees WHERE email = ?", [email]);
      return res.json(rows);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch devotees" });
    }
  });

  // Add devotee
  app.post("/api/devotees", verifyToken, allowAdmin, upload.single("photo"), async (req, res) => {
    try {
      const {
        first_name, middle_name, last_name, gender, dob, ethnicity, citizenship, marital_status,
        education_qualification_code, address1, address2, pin_code, email, mobile_no, whatsapp_no,
        initiated_name, spiritual_master_id, first_initiation_date, iskcon_first_contact_date,
        second_initiated, second_initiation_date, full_time_devotee, temple_name, status, facilitator_id
      } = req.body;

      const photo = req.file ? `/uploads/${req.file.filename}` : null;

      const params = [
        first_name, middle_name, last_name, gender, dob, ethnicity, citizenship, marital_status,
        education_qualification_code, address1, address2, pin_code, email, mobile_no, whatsapp_no,
        initiated_name, photo, spiritual_master_id, first_initiation_date, iskcon_first_contact_date,
        second_initiated, second_initiation_date, full_time_devotee, temple_name, status, facilitator_id
      ].map(v => v === undefined ? null : v);

      const [result] = await db.execute(
          `INSERT INTO devotees (
            first_name, middle_name, last_name, gender, dob, ethnicity, citizenship, marital_status,
            education_qualification_code, address1, address2, pin_code, email, mobile_no, whatsapp_no,
            initiated_name, photo, spiritual_master_id, first_initiation_date, iskcon_first_contact_date,
            second_initiated, second_initiation_date, full_time_devotee, temple_name, status, facilitator_id
          ) VALUES (${params.map(() => "?").join(", ")})`,
          params
      );

      // Insert into users table
      if (email) {
        const bcrypt = await import('bcrypt');
        const defaultPassword = "Hari@108";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await db.execute(
        "INSERT IGNORE INTO users (email, password, role, user_type) VALUES (?, ?, ?, ?)",
        [email, hashedPassword, "user", "trial"]
        );
      }

      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error("❌ Error inserting devotee:", err);
      res.status(500).json({ error: "Failed to create devotee", details: err.message });
    }
  });

  // Update devotee (admin only)
  app.put("/api/devotees/:id", verifyToken, allowAdmin, upload.single("photo"), async (req, res) => {
    // ...existing code for admin update...
    console.log("Updating devotee with ID:", req.params.id);
    try {
      const id = req.params.id;
      const allowedFields = [
        "first_name", "middle_name", "last_name", "gender", "dob", "ethnicity", "citizenship", "marital_status",
        "education_qualification_code", "address1", "address2", "pin_code", "email", "mobile_no", "whatsapp_no",
        "initiated_name", "photo", "spiritual_master_id", "first_initiation_date", "iskcon_first_contact_date",
        "second_initiated", "second_initiation_date", "full_time_devotee", "temple_name", "facilitator_id"
      ];
      let photo = null;
      if (req.file) {
        photo = `/uploads/${req.file.filename}`;
      } else if (req.body.photo) {
        photo = req.body.photo;
      } else {
        const [[existing]] = await db.execute("SELECT photo FROM devotees WHERE id=?", [id]);
        photo = existing?.photo ?? null;
      }

      const params = allowedFields.map(field => field === "photo" ? photo : req.body[field] ?? null);
      params.push(id);

      const [result] = await db.execute(
          `UPDATE devotees SET ${allowedFields.map(field => `${field}=?`).join(", ")} WHERE id=?`,
          params
      );

      res.json({ updated: result.affectedRows > 0 });
    } catch (err) {
      console.error("❌ Error updating devotee:", err);
      res.status(500).json({ error: "Failed to update devotee", details: err.message });
    }
  });

  // Update own devotee profile (self-service, not admin)
  app.put("/api/devotees/:id/self", verifyToken, upload.single("photo"), async (req, res) => {
    try {
      const userEmail = req.user?.email;
      const emailParam = req.params.id;
      console.log("jwt token email:", userEmail, "Devotee email from params:", emailParam);
      if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized: No email in token" });
      }
      // Check that this devotee belongs to the user
      if (emailParam !== userEmail) {
        return res.status(403).json({ error: "Forbidden: You can only update your own profile" });
      }
      const [[devotee]] = await db.execute("SELECT email FROM devotees WHERE email=?", [emailParam]);
      if (!devotee) {
        return res.status(404).json({ error: "Devotee not found" });
      }
      const allowedFields = [
        "first_name", "middle_name", "last_name", "gender", "dob", "ethnicity", "citizenship", "marital_status",
        "education_qualification_code", "address1", "address2", "pin_code", "email", "mobile_no", "whatsapp_no",
        "initiated_name", "photo", "spiritual_master_id", "first_initiation_date", "iskcon_first_contact_date",
        "second_initiated", "second_initiation_date", "full_time_devotee", "temple_name", "facilitator_id"
      ];
      let photo = null;
      if (req.file) {
        photo = `/uploads/${req.file.filename}`;
      } else if (req.body.photo) {
        photo = req.body.photo;
      } else {
        const [[existing]] = await db.execute("SELECT photo FROM devotees WHERE email=?", [emailParam]);
        photo = existing?.photo ?? null;
      }
      const params = allowedFields.map(field => field === "photo" ? photo : req.body[field] ?? null);
      params.push(emailParam);
      const [result] = await db.execute(
        `UPDATE devotees SET ${allowedFields.map(field => `${field}=?`).join(", ")} WHERE email=?`,
        params
      );
      res.json({ updated: result.affectedRows > 0 });
    } catch (err) {
      console.error("❌ Error updating own devotee profile:", err);
      res.status(500).json({ error: "Failed to update devotee", details: err.message });
    }
  });

  // Delete devotee
  app.delete("/api/devotees/:id", verifyToken, allowAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const [result] = await db.execute("DELETE FROM devotees WHERE id=?", [id]);
      res.json({ deleted: result.affectedRows > 0 });
    } catch (err) {
      console.error("❌ Error deleting devotee:", err);
      res.status(500).json({ error: "Failed to delete devotee" });
    }
  });

  // Bulk upload
  app.post("/api/devotees/bulk", verifyToken, allowAdmin, async (req, res) => {
    try {
      const devotees = req.body.devotees;
      if (!Array.isArray(devotees) || devotees.length === 0) {
        return res.status(400).json({ error: "Invalid data format" });
      }

      const fields = [
        "first_name", "middle_name", "last_name", "gender", "dob", "ethnicity", "citizenship", "marital_status",
        "education_qualification_code", "address1", "address2", "pin_code", "email", "mobile_no", "whatsapp_no",
        "initiated_name", "photo", "spiritual_master_id", "first_initiation_date", "iskcon_first_contact_date",
        "second_initiated", "second_initiation_date", "full_time_devotee", "temple_name", "status", "facilitator_id"
      ];

      const values = devotees.map(d => fields.map(field => d[field] ?? null));
      const placeholders = values.map(row => `(${row.map(() => '?').join(', ')})`).join(', ');
      const flatValues = values.flat();
      const query = `INSERT INTO devotees (${fields.join(', ')}) VALUES ${placeholders}`;

      await db.execute(query, flatValues);


      // Insert into users table
      const bcrypt = await import('bcrypt');
      const defaultPassword = "Hari@108";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const userInsertPromises = devotees.map(devotee => {
        if (!devotee.email) return null;
        return db.execute(
        "INSERT IGNORE INTO users (email, password, role, user_type) VALUES (?, ?, ?, ?)",
        [devotee.email, hashedPassword, "user", "trial"]
        );
      });
      await Promise.all(userInsertPromises.filter(Boolean));
      res.status(201).json({ message: "Bulk upload successful", count: devotees.length });
    } catch (err) {
      console.error("❌ Bulk upload error:", err);
      res.status(500).json({ error: "Bulk upload failed", details: err.message });
    }
  });

  app.get('/api/sadhana/date/:userId/:date', async (req, res) => {
    const { userId, date } = req.params;
    const query = `
      SELECT * FROM sadhana_entries
      WHERE user_id = ? AND entry_date = ?
    `;
    const [rows] = await db.execute(query, [userId, date]);
    res.json(rows);
  });

  app.get('/api/deployment-test', (req, res) => {
    res.json({ success: true, message: 'Backend deployment successful!' });
  });



  app.get("/api/counsellor/devotees", verifyToken, async (req, res) => {
    const email = req.query.user_id; // email from frontend

    if (!email) {
      return res.status(400).json({ error: "Missing user_id (email)" });
    }

    try {
      const [[user]] = await db.execute("SELECT id FROM devotees WHERE email = ?", [email]);
      if (!user) return res.status(404).json({ error: "User not found" });

      const facilitatorId = user.id;

      console.log("facilitatorId:", facilitatorId);

      const [devotees] = await db.execute(`
      SELECT d.initiated_name, d.id,d.email
      FROM devotees d
      WHERE d.facilitator_id = ?
    `, [facilitatorId]);

      console.log("devotees under this councellor:", devotees);

      res.json(devotees.map(d => ({ devotee: d })));
    } catch (err) {
      console.error("Error fetching devotees:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/sadhana/by-email", verifyToken, async (req, res) => {
    const { id, month, year, page = 1 } = req.query;
    const pageSize = parseInt(10);
    const offset = parseInt((parseInt(page) - 1) * pageSize);

    if (!id || !month || !year) {
      return res.status(400).json({ error: "Missing id, month, or year" });
    }
    try {

      const dateFilter = `${year}-${month}`;

      const [entries] = await db.execute(
          `SELECT * FROM sadhana_entries
           WHERE user_id = ? AND DATE_FORMAT(entry_date, '%Y-%m') = ?
           ORDER BY entry_date DESC
             LIMIT ${pageSize} OFFSET ${offset}`,
          [id, dateFilter]
      );

      const [[countResult]] = await db.execute(
          `SELECT COUNT(*) as count FROM sadhana_entries
           WHERE user_id = ? AND DATE_FORMAT(entry_date, '%Y-%m') = ?`,
          [id, dateFilter]
      );

      const totalPages = Math.ceil(countResult.count / pageSize);
      res.json({ entries, totalPages });
    } catch (err) {
      console.error("❌ Error fetching sadhana entries:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/users/assign-role", verifyToken, allowAdmin, async (req, res) => {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }

    const validRoles = ["user", "admin", "counsellor"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    try {
      const [result] = await db.execute(
          "UPDATE users SET role = ? WHERE email = ?",
          [role, email]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: `Role updated to '${role}' for ${email}` });
    } catch (err) {
      console.error("❌ Error updating role:", err);
      res.status(500).json({ error: "Failed to update role", details: err.message });
    }
  });

  app.get("/api/users/by-email", verifyToken, allowAdmin, async (req, res) => {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const [rows] = await db.execute(
          "SELECT id, email, role, created_at FROM users WHERE email = ?",
          [email]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error("❌ Error fetching user by email:", err);
      res.status(500).json({ error: "Failed to fetch user", details: err.message });
    }
  });


  app.get("/api/facilitators", verifyToken, async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT d.id AS user_id, d.initiated_name
        FROM devotees d
               JOIN users u ON u.email = d.email
        WHERE u.role = 'counsellor'
    `);
      res.json(rows);
    } catch (err) {
      console.error("❌ Error fetching counsellors:", err);
      res.status(500).json({ error: "Failed to fetch counsellors" });
    }
  });

  app.get("/api/devotees/:id/initiated-name", verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
      const [[devotee]] = await db.execute(
          "SELECT initiated_name FROM devotees WHERE id = ?",
          [id]
      );
      if (!devotee) {
        return res.status(404).json({ error: "Devotee not found" });
      }
      res.json({ initiated_name: devotee.initiated_name });
    } catch (err) {
      console.error("❌ Error fetching initiated name:", err);
      res.status(500).json({ error: "Failed to fetch initiated name" });
    }
  });

// API: Download devotees.xlsx (admin only)
app.get("/api/download/devotees-xlsx", verifyToken, allowAdmin, (req, res) => {
  const filePath = path.resolve("public/devotees.xlsx");
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  // Set correct MIME type for Excel
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=devotees.xlsx');
  res.download(filePath, "devotees.xlsx", (err) => {
    if (err) {
      console.error("Error sending devotees.xlsx:", err);
      // Don't send another response if headers are already sent
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to download file" });
      }
    }
  });
});


  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
