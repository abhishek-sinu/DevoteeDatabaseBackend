/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Send a notification to a devotee
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - message
 *               - sent_by
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient devotee's email
 *               message:
 *                 type: string
 *               sent_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification sent
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /notifications/view:
 *   get:
 *     summary: Get notifications for a devotee by email
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: devotee_email
 *         schema:
 *           type: string
 *         required: true
 *         description: Devotee's email
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   message:
 *                     type: string
 *                   sent_by:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /notifications/status:
 *   put:
 *     summary: Update notification status (read/unread)
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - status
 *             properties:
 *               id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [read, unread]
 *     responses:
 *       200:
 *         description: Notification status updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
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
