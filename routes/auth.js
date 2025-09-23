import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Create DB connection
let db;
(async () => {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });
        console.log("✅ Auth DB connected");
    } catch (err) {
        console.error("❌ Auth DB connection failed:", err);
    }
})();

// 🔐 Register Endpoint
router.post("/register", async (req, res) => {
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
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
});

export default router;
