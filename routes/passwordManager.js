import express from 'express';
import { encrypt, decrypt } from '../middleware/auth.js';
import { verifyToken as authenticateToken } from '../middleware/auth.js';
import db from '../db.js';

const router = express.Router();

async function getUserIdFromTokenEmail(email) {
    const [rows] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    return rows.length ? rows[0].id : null;
}

// Add a new password entry
router.post('/', authenticateToken, async (req, res) => {
    const { service_name, username, password } = req.body;
    const encryptedPassword = encrypt(password);

    try {
        const userId = await getUserIdFromTokenEmail(req.user.email);
        if (!userId) {
            return res.status(401).json({ error: 'User not found for token' });
        }

        const [result] = await db.execute(
            'INSERT INTO password_manager (user_id, service_name, username, encrypted_password) VALUES (?, ?, ?, ?)',
            [userId, service_name, username, encryptedPassword]
        );

        const [rows] = await db.execute(
            'SELECT id, service_name, username, encrypted_password, created_at FROM password_manager WHERE id = ? LIMIT 1',
            [result.insertId]
        );

        const row = rows[0];
        res.status(201).json({
            ...row,
            decrypted_password: decrypt(row.encrypted_password)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add password entry' });
    }
});

// Get all password entries for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = await getUserIdFromTokenEmail(req.user.email);
        if (!userId) {
            return res.status(401).json({ error: 'User not found for token' });
        }

        const [rows] = await db.execute(
            'SELECT id, service_name, username, encrypted_password, created_at FROM password_manager WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        const data = rows.map((row) => ({
            ...row,
            decrypted_password: decrypt(row.encrypted_password)
        }));

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch password entries' });
    }
});

// Update a password entry
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { service_name, username, password } = req.body;
    const encryptedPassword = encrypt(password);

    try {
        const userId = await getUserIdFromTokenEmail(req.user.email);
        if (!userId) {
            return res.status(401).json({ error: 'User not found for token' });
        }

        const [result] = await db.execute(
            'UPDATE password_manager SET service_name = ?, username = ?, encrypted_password = ? WHERE id = ? AND user_id = ?',
            [service_name, username, encryptedPassword, id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Password entry not found' });
        }

        const [rows] = await db.execute(
            'SELECT id, service_name, username, encrypted_password, created_at FROM password_manager WHERE id = ? AND user_id = ? LIMIT 1',
            [id, userId]
        );

        const row = rows[0];
        res.status(200).json({
            ...row,
            decrypted_password: decrypt(row.encrypted_password)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update password entry' });
    }
});

// Delete a password entry
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const userId = await getUserIdFromTokenEmail(req.user.email);
        if (!userId) {
            return res.status(401).json({ error: 'User not found for token' });
        }

        const [result] = await db.execute(
            'DELETE FROM password_manager WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Password entry not found' });
        }

        res.status(200).json({ message: 'Password entry deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete password entry' });
    }
});

export default router;