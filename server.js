  import express from "express";
  import mysql from "mysql2/promise";
  import cors from "cors";
  import dotenv from "dotenv";
  import multer from "multer";
  import path from "path";
  import { verifyToken, allowAdmin } from "./middleware/auth.js";
  import authRoutes from "./routes/auth.js";
  import sadhanaRoutes from "./routes/sadhana.js";
  import db from "./db.js";

  dotenv.config();
  const app = express();


  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());
  app.use("/api", authRoutes);
  app.use("/uploads", express.static("uploads"));
  app.use("/api/sadhana", sadhanaRoutes);


  // Multer setup
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });
  const upload = multer({ storage });



  // Health check
  app.get("/api/health", async (req, res) => res.json({ ok: true }));

  // Get devotees
  app.get("/api/devotees", verifyToken, async (req, res) => {
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

  // Add devotee
  app.post("/api/devotees", verifyToken, allowAdmin, upload.single("photo"), async (req, res) => {
    try {
      const {
        first_name, middle_name, last_name, gender, dob, ethnicity, citizenship, marital_status,
        education_qualification_code, address1, address2, pin_code, email, mobile_no, whatsapp_no,
        initiated_name, spiritual_master_id, first_initiation_date, iskcon_first_contact_date,
        second_initiated, second_initiation_date, full_time_devotee, temple_name, status,facilitator_id
      } = req.body;

      const photo = req.file ? `/uploads/${req.file.filename}` : null;

      const params = [
        first_name, middle_name, last_name, gender, dob, ethnicity, citizenship, marital_status,
        education_qualification_code, address1, address2, pin_code, email, mobile_no, whatsapp_no,
        initiated_name, photo, spiritual_master_id, first_initiation_date, iskcon_first_contact_date,
        second_initiated, second_initiation_date, full_time_devotee, temple_name, status,facilitator_id
      ].map(v => v === undefined ? null : v);

      console.log("📦 Insert Params:", params);

      const [result] = await db.execute(
          `INSERT INTO devotees (
            first_name, middle_name, last_name, gender, dob, ethnicity, citizenship, marital_status,
            education_qualification_code, address1, address2, pin_code, email, mobile_no, whatsapp_no,
            initiated_name, photo, spiritual_master_id, first_initiation_date, iskcon_first_contact_date,
            second_initiated, second_initiation_date, full_time_devotee, temple_name, status, facilitator_id
          ) VALUES (${params.map(() => "?").join(", ")})`,
          params
      );

      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error("❌ Error inserting devotee:", err);
      res.status(500).json({ error: "Failed to create devotee", details: err.message });
    }
  });

  // Update devotee
  app.put("/api/devotees/:id", verifyToken, allowAdmin, upload.single("photo"), async (req, res) => {
    try {
      const id = req.params.id;
      const allowedFields = [
        "first_name", "middle_name", "last_name", "gender", "dob", "ethnicity", "citizenship", "marital_status",
        "education_qualification_code", "address1", "address2", "pin_code", "email", "mobile_no", "whatsapp_no",
        "initiated_name", "photo", "spiritual_master_id", "first_initiation_date", "iskcon_first_contact_date",
        "second_initiated", "second_initiation_date", "full_time_devotee", "temple_name", "status", "facilitator_id"
      ];

      let photo;
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
        "second_initiated", "second_initiation_date", "full_time_devotee", "temple_name", "status"
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
            "INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)",
            [devotee.email, hashedPassword, "user"]
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


  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
