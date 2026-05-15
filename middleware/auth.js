import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ✅ Middleware to verify JWT token
export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
}

// ✅ Middleware to allow only admin
export function allowAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied: Admins only" });
    }
    next();
}

// ✅ Function to decrypt data
export function decrypt(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// ✅ Function to encrypt data
import CryptoJS from "crypto-js";

export function encrypt(data) {
    try {
        return CryptoJS.AES.encrypt(data, SECRET).toString();
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}
