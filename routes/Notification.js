import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Send notification: expects email, message, sent_by
// Send notification: expects to, message, sent_by
router.post('/send', async (req, res) => {
	const { to, message, sent_by } = req.body;
	console.log(`[Notification][SEND] Payload:`, { to, message, sent_by });
	if (!to || !message || !sent_by) {
		console.warn('[Notification][SEND] Missing required fields:', { to, message, sent_by });
		return res.status(400).json({ message: 'email, message, and sent_by are required.' });
	}
	try {
		const [result] = await pool.query(
			'INSERT INTO notifications (devotee_email, message, sent_by, status) VALUES (?, ?, ?, ?)',
			[to, message, sent_by, 'unread']
		);
		console.log(`[Notification][SEND] Notification inserted with id: ${result.insertId}`);
		res.status(201).json({ message: 'Notification sent.', notification_id: result.insertId });
	} catch (err) {
		console.error('[Notification][SEND] Error:', err);
		res.status(500).json({ message: 'Failed to send notification.' });
	}
});

// Get notifications for a devotee by email
router.get('/view', async (req, res) => {
	const { devotee_email } = req.query;
	console.log(`[Notification][VIEW] Query param: devotee_email=${devotee_email}`);
	if (!devotee_email) {
		console.warn('[Notification][VIEW] Missing devotee_email query param');
		return res.status(400).json({ message: 'devotee_email is required as query param.' });
	}
	try {
		const [rows] = await pool.query(
			'SELECT id, message, sent_by, created_at, status FROM notifications WHERE devotee_email = ? ORDER BY created_at DESC',
			[devotee_email]
		);
		console.log(`[Notification][VIEW] Returned ${rows.length} notifications for ${devotee_email}`);
		res.json(rows);
	} catch (err) {
		console.error('[Notification][VIEW] Error:', err);
		res.status(500).json({ message: 'Failed to fetch notifications.' });
	}
});

// Update notification status (read/unread) by notification id
router.put('/status', async (req, res) => {
	const { id, status } = req.body;
	console.log(`[Notification][STATUS] Update request:`, { id, status });
	if (!id || !status || !['read', 'unread'].includes(status)) {
		console.warn('[Notification][STATUS] Invalid request body:', { id, status });
		return res.status(400).json({ message: 'id and valid status (read/unread) are required.' });
	}
	try {
		const [result] = await pool.query(
			'UPDATE notifications SET status = ? WHERE id = ?',
			[status, id]
		);
		if (result.affectedRows === 0) {
			console.warn(`[Notification][STATUS] Notification not found for id: ${id}`);
			return res.status(404).json({ message: 'Notification not found.' });
		}
		console.log(`[Notification][STATUS] Notification id ${id} updated to status '${status}'`);
		res.json({ message: 'Notification status updated.' });
	} catch (err) {
		console.error('[Notification][STATUS] Error:', err);
		res.status(500).json({ message: 'Failed to update notification status.' });
	}
});


export default router;
