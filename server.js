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
    try {
      const [rows] = await db.execute("SELECT * FROM devotees ORDER BY created_at DESC");
      res.json(rows);
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
        second_initiated, second_initiation_date, full_time_devotee, temple_name, status
      } = req.body;

      const photo = req.file ? `/uploads/${req.file.filename}` : null;

      const params = [
        first_name, middle_name, last_name, gender, dob, ethnicity, citizenship, marital_status,
        education_qualification_code, address1, address2, pin_code, email, mobile_no, whatsapp_no,
        initiated_name, photo, spiritual_master_id, first_initiation_date, iskcon_first_contact_date,
        second_initiated, second_initiation_date, full_time_devotee, temple_name, status
      ].map(v => v === undefined ? null : v);

      console.log("📦 Insert Params:", params);

      const [result] = await db.execute(
          `INSERT INTO devotees (
            first_name, middle_name, last_name, gender, dob, ethnicity, citizenship, marital_status,
            education_qualification_code, address1, address2, pin_code, email, mobile_no, whatsapp_no,
            initiated_name, photo, spiritual_master_id, first_initiation_date, iskcon_first_contact_date,
            second_initiated, second_initiation_date, full_time_devotee, temple_name, status
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
        "second_initiated", "second_initiation_date", "full_time_devotee", "temple_name", "status"
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



  app.get("/api/counsellor/devotees-sadhana", verifyToken, async (req, res) => {
    const email = req.query.user_id; // email from frontend

    if (!email) {
      return res.status(400).json({ error: "Missing user_id (email)" });
    }

    try {
      const [[user]] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
      if (!user) return res.status(404).json({ error: "User not found" });

      const councellerId = user.id;

      console.log("councellerId:", councellerId);

      const [devotees] = await db.execute(`
      SELECT d.initiated_name, d.email
      FROM devotees d
      WHERE d.counceller_id = ?
    `, [councellerId]);

      console.log("devotees under this councellor:", devotees);

      res.json(devotees.map(d => ({ devotee: d })));
    } catch (err) {
      console.error("Error fetching devotees:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/sadhana/by-email", verifyToken, async (req, res) => {
    const { email, month, year, page = 1 } = req.query;
    const pageSize = parseInt(10);
    const offset = parseInt((parseInt(page) - 1) * pageSize);

    if (!email || !month || !year) {
      return res.status(400).json({ error: "Missing email, month, or year" });
    }
    try {
      const [[user]] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
      if (!user) return res.status(404).json({ error: "User not found" });

      const dateFilter = `${year}-${month}`;

      const [entries] = await db.execute(
          `SELECT * FROM sadhana_entries
           WHERE user_id = ? AND DATE_FORMAT(entry_date, '%Y-%m') = ?
           ORDER BY entry_date DESC
             LIMIT ${pageSize} OFFSET ${offset}`,
          [user.id, dateFilter]
      );

      const [[countResult]] = await db.execute(
          `SELECT COUNT(*) as count FROM sadhana_entries
           WHERE user_id = ? AND DATE_FORMAT(entry_date, '%Y-%m') = ?`,
          [user.id, dateFilter]
      );

      const totalPages = Math.ceil(countResult.count / pageSize);
      res.json({ entries, totalPages });
    } catch (err) {
      console.error("❌ Error fetching sadhana entries:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
