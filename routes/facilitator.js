import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * @swagger
 * /facilitator/devotees-by-facilitator-id:
 *   get:
 *     summary: Get all devotees under a facilitator by facilitator id
 *     tags: [Facilitator]
 *     parameters:
 *       - in: query
 *         name: facilitator_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Facilitator ID
 *     responses:
 *       200:
 *         description: List of devotees
 *       400:
 *         description: facilitator_id is required
 *       500:
 *         description: Server error
 */
router.get('/devotees-by-facilitator-id', async (req, res) => {
    const { facilitator_id } = req.query;
    console.log(`[Facilitator][devotees-by-facilitator-id] Query param: facilitator_id=${facilitator_id}`);
    if (!facilitator_id) {
        console.warn('[Facilitator][devotees-by-facilitator-id] Missing facilitator_id query param');
        return res.status(400).json({ message: 'facilitator_id is required as query param.' });
    }
    try {
        const [devotees] = await db.execute(
            'SELECT id, first_name, last_name, initiated_name, email FROM devotees WHERE facilitator_id = ?',
            [facilitator_id]
        );
        console.log(`[Facilitator][devotees-by-facilitator-id] Found ${devotees.length} devotees for facilitator_id ${facilitator_id}`);
        res.json(devotees);
    } catch (err) {
        console.error('[Facilitator][devotees-by-facilitator-id] Error:', err);
        res.status(500).json({ message: 'Failed to fetch devotees.' });
    }
});

/**
 * @swagger
 * /facilitator/by-devotee-id:
 *   get:
 *     summary: Get facilitator info by devotee id
 *     tags: [Facilitator]
 *     parameters:
 *       - in: query
 *         name: devotee_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Devotee ID
 *     responses:
 *       200:
 *         description: Facilitator info
 *       400:
 *         description: devotee_id is required
 *       404:
 *         description: Facilitator not found
 *       500:
 *         description: Server error
 */
router.get('/by-devotee-id', async (req, res) => {
    const { devotee_id } = req.query;
    console.log(`[Facilitator][by-devotee-id] Query param: devotee_id=${devotee_id}`);
    if (!devotee_id) {
        console.warn('[Facilitator][by-devotee-id] Missing devotee_id query param');
        return res.status(400).json({ message: 'devotee_id is required as query param.' });
    }
    try {
        // Get facilitator_id for the devotee
        const [[devotee]] = await db.execute(
            'SELECT facilitator_id FROM devotees WHERE email = ?',
            [devotee_id]
        );
        console.log(`[Facilitator][by-devotee-id] facilitator_id for devotee ${devotee_id}:`, devotee?.facilitator_id);
        if (!devotee || !devotee.facilitator_id) {
            console.warn(`[Facilitator][by-devotee-id] Facilitator not found for devotee_id: ${devotee_id}`);
            return res.status(404).json({ message: 'Facilitator not found for this devotee.' });
        }
        // Get facilitator details
        const [[facilitator]] = await db.execute(
            'SELECT id, first_name, last_name, initiated_name, email FROM devotees WHERE id = ?',
            [devotee.facilitator_id]
        );
        if (!facilitator) {
            console.warn(`[Facilitator][by-devotee-id] Facilitator details not found for id: ${devotee.facilitator_id}`);
            return res.status(404).json({ message: 'Facilitator not found.' });
        }
        console.log(`[Facilitator][by-devotee-id] Facilitator found:`, facilitator);
        res.json(facilitator);
    } catch (err) {
        console.error('[Facilitator][by-devotee-id] Error:', err);
        res.status(500).json({ message: 'Failed to fetch facilitator.' });
    }
});

export default router;
