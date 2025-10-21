import express from "express";
import multer from "multer";
import path from "path";
import db from "../db.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Multer storage for sadhana cards
const sadhanaCardStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/sadhana-cards"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const sadhanaCardUpload = multer({
  storage: sadhanaCardStorage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|xls|xlsx/;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.test(ext));
  }
});

// GET endpoint to fetch sadhana card file info
router.get("/sadhana-card", async (req, res) => {
  const { email, month, year } = req.query;
  console.log('GET /sadhana-card called with:', { email, month, year });
  if (!email || !month || !year) {
    console.log('Missing required query params');
    return res.status(400).json({ error: "Missing email, month, or year" });
  }
  try {
    console.log('Querying sadhana_cards table...');
    const [rows] = await db.execute(
        "SELECT file_path FROM sadhana_cards WHERE email = ? AND month = ? AND year = ?",
        [email, month, year]
    );
    console.log('Query result:', rows);
    if (rows.length === 0) {
      console.log('No sadhana card found for given params');
      return res.status(404).json({ error: "No sadhana card found" });
    }
    console.log('Returning filePath:', rows[0].file_path);
    res.json({ filePath: rows[0].file_path });
  } catch (err) {
    console.error('Error fetching sadhana card:', err);
    res.status(500).json({ error: "Failed to fetch sadhana card" });
  }
});

// POST endpoint for uploading sadhana card
router.post("/upload-sadhana-card", sadhanaCardUpload.single("file"), async (req, res) => {
  try {
    const { month, year, email } = req.body;
    if (!req.file || !month || !year || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const filePath = `/uploads/sadhana-cards/${req.file.filename}`;

    // Check if a record exists for this email, month, and year
    console.log('Checking for existing sadhana card:', { email, month, year });
    const [rows] = await db.execute(
      "SELECT file_path FROM sadhana_cards WHERE email = ? AND month = ? AND year = ?",
      [email, month, year]
    );
    console.log('Existing rows:', rows);
    if (rows.length > 0) {
      // Delete the old file
      const oldFilePath = rows[0].file_path;
      console.log('Deleting old file:', oldFilePath);
      const fs = await import('fs/promises');
      try {
        await fs.unlink(`.${oldFilePath}`);
        console.log('Old file deleted successfully');
      } catch (e) {
        console.log('Error deleting old file (may not exist):', e);
      }
      // Update the record with new file path
      await db.execute(
        "UPDATE sadhana_cards SET file_path = ? WHERE email = ? AND month = ? AND year = ?",
        [filePath, email, month, year]
      );
      console.log('Sadhana card record updated');
      res.status(200).json({ message: "Sadhana card updated successfully", filePath });
    } else {
      // Insert new record
      await db.execute(
        "INSERT INTO sadhana_cards (email, month, year, file_path) VALUES (?, ?, ?, ?)",
        [email, month, year, filePath]
      );
      console.log('Sadhana card record inserted');
      res.status(201).json({ message: "Sadhana card uploaded successfully", filePath });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Search devotees by name or email
router.get('/devotees/search', async (req, res) => {
  const query = req.query.query;
  console.log('GET /api/devotees/search called with query:', query);
  if (!query || query.trim().length < 2) {
    console.log('Query too short or missing');
    return res.json([]);
  }
  try {
    console.log('Searching devotees table...');
    const [rows] = await db.execute(
        `SELECT id, first_name, last_name, initiated_name, email 
       FROM devotees 
       WHERE first_name LIKE ? OR last_name LIKE ? OR initiated_name LIKE ? OR email LIKE ? 
       LIMIT 10`,
        [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );
    console.log('Search result:', rows);
    res.json(rows);
  } catch (err) {
    console.error('Error searching devotees:', err);
    res.status(500).json([]);
  }
});

export default router;
