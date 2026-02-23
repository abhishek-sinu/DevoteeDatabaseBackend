/**
 * @swagger
 * /sadhana/add:
 *   post:
 *     summary: Create a Sadhana entry
 *     tags: [Sadhana]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               entryDate:
 *                 type: string
 *                 format: date
 *               wakeUpTime:
 *                 type: string
 *               chantingRounds:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Sadhana entry added successfully
 *       404:
 *         description: User or Devotee not found
 *       500:
 *         description: Database error
 */
/**
 * @swagger
 * /sadhana/entries/{email}:
 *   get:
 *     summary: Get all Sadhana entries for a user
 *     tags: [Sadhana]
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: User's email
 *     responses:
 *       200:
 *         description: List of Sadhana entries
 *       404:
 *         description: User not found
 *       500:
 *         description: Database error
 */
import express from 'express';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const toMinutes = (value, unit) => {
    const num = parseInt(value);
    if (isNaN(num)) return null;
    return unit === 'hours' ? num * 60 : num;
};

// 🔹 Create Sadhana Entry
router.post('/add', async (req, res) => {
    const {
        email,
        entryDate,
        wakeUpTime,
        chantingRounds,
        readingTime,
        readingTopic,
        hearingTime,
        hearingTopic,
        serviceName,
        serviceTime
    } = req.body;

    try {
        // Check if user exists
        const [userRows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get devotee id by email
        const [devoteeRows] = await db.execute('SELECT id FROM devotees WHERE email = ?', [email]);
        if (devoteeRows.length === 0) {
            return res.status(404).json({ error: 'Devotee not found' });
        }
        const devoteeId = devoteeRows[0].id;

        const entryDateOnly = entryDate ? entryDate.split('T')[0] : null;

        const query = `
            INSERT INTO sadhana_entries (
                user_id, entry_date, wake_up_time, chanting_rounds,
                reading_time, reading_topic, hearing_time, hearing_topic,
                service_name, service_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(query, [
            devoteeId,
            entryDateOnly,
            wakeUpTime,
            chantingRounds,
            readingTime,
            readingTopic,
            hearingTime,
            hearingTopic,
            serviceName,
            serviceTime
        ]);

        res.status(201).json({ message: 'Sadhana entry added successfully' });
    } catch (error) {
        console.error('❌ Error inserting sadhana entry:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// 🔹 Read All Entries for a User
router.get('/entries/:email', async (req, res) => {
    const { email } = req.params;
    console.log("Fetching entries for email:", email);
    try {
        const [userRows] = await db.execute('SELECT id FROM devotees WHERE email = ?', [email]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userRows[0].id;
        console.log("Fetching entries for userId:", userId);

        const [entries] = await db.execute(
            'SELECT * FROM sadhana_entries WHERE user_id = ? ORDER BY entry_date DESC',
            [userId]
        );

        res.status(200).json(entries);
    } catch (error) {
        console.error('❌ Error fetching entries:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// 🔹 Update Entry for a Specific Date
router.put('/update', async (req, res) => {
    const {
        email,
        entryDate,
        wakeUpTime,
        chantingRounds,
        readingTime,
        readingTopic,
        hearingTime,
        hearingTopic,
        serviceName,
        serviceTime
    } = req.body;

    try {
        const [userRows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userRows[0].id;

        const query = `
      UPDATE sadhana_entries SET
        wake_up_time = ?, chanting_rounds = ?, reading_time = ?, reading_topic = ?,
        hearing_time = ?, hearing_topic = ?, service_name = ?, service_time = ?
      WHERE user_id = ? AND entry_date = ?
    `;

        const [result] = await db.execute(query, [
            wakeUpTime,
            chantingRounds,
            readingTime,
            readingTopic,
            hearingTime,
            hearingTopic,
            serviceName,
            serviceTime,
            userId,
            entryDate
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Entry not found for update' });
        }

        res.status(200).json({ message: 'Sadhana entry updated successfully' });
    } catch (error) {
        console.error('❌ Error updating entry:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// 🔹 Delete Entry for a Specific Date
router.delete('/delete', async (req, res) => {
    const { email, entryDate } = req.body;

    try {
        const [userRows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userRows[0].id;
        const [result] = await db.execute(
            'DELETE FROM sadhana_entries WHERE user_id = ? AND entry_date = ?',
            [userId, entryDate]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Entry not found for deletion' });
        }

        res.status(200).json({ message: 'Sadhana entry deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting entry:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// 🔹 Update entry by ID (used by frontend: PUT /api/sadhana/entries/:id)
router.put('/entries/:id', async (req, res) => {
    const { id } = req.params;
    console.log('[Sadhana][Update by ID] req.params:', req.params);
    console.log('[Sadhana][Update by ID] req.body:', req.body);
    const {
        entryDate,
        wakeUpTime,
        chantingRounds,
        readingTime,
        readingTopic,
        hearingTime,
        hearingTopic,
        serviceName,
        serviceTime
    } = req.body;
    
    try {
        const params = [
            entryDate,
            wakeUpTime,
            chantingRounds,
            readingTime,
            readingTopic,
            hearingTime,
            hearingTopic,
            serviceName,
            serviceTime,
            id
        ];
        console.log('[Sadhana][Update by ID] Params:', params);
        const query = `
            UPDATE sadhana_entries SET
                entry_date = ?, wake_up_time = ?, chanting_rounds = ?, reading_time = ?, reading_topic = ?,
                hearing_time = ?, hearing_topic = ?, service_name = ?, service_time = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        // return the updated row
        const [rows] = await db.execute('SELECT * FROM sadhana_entries WHERE id = ?', [id]);
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('❌ Error updating entry by id:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// 🔹 Delete entry by ID (used by frontend: DELETE /api/sadhana/entries/:id)
router.delete('/entries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM sadhana_entries WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.status(200).json({ message: 'Sadhana entry deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting entry by id:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

/**
 * @swagger
 * /sadhana/entries-by-month:
 *   get:
 *     summary: Get all sadhana entries for a user for a given month and year
 *     tags: [Sadhana]
 *     parameters:
 *       - in: query
 *         name: user_id
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
 *     responses:
 *       200:
 *         description: List of sadhana entries for the month
 *       400:
 *         description: Missing required params
 *       500:
 *         description: Server error
 */
router.get('/entries-by-month', async (req, res) => {
    const { user_id, month, year } = req.query;
    console.log(`[Sadhana][entries-by-month] Params: user_id=${user_id}, month=${month}, year=${year}`);
    if (!user_id || !month || !year) {
        console.warn('[Sadhana][entries-by-month] Missing required params');
        return res.status(400).json({ message: 'user_id, month, and year are required as query params.' });
    }
    try {
        const dateFilter = `${year}-${month}`;
        const [entries] = await db.execute(
            `SELECT * FROM sadhana_entries WHERE user_id = ? AND DATE_FORMAT(entry_date, '%Y-%m') = ? ORDER BY entry_date`,
            [user_id, dateFilter]
        );
        console.log(`[Sadhana][entries-by-month] Found ${entries.length} entries for user_id ${user_id} in ${dateFilter}`);
        res.json(entries);
    } catch (err) {
        console.error('[Sadhana][entries-by-month] Error:', err);
        res.status(500).json({ message: 'Failed to fetch sadhana entries.' });
    }
});

// 🔹 Sadhana Template Management
// GET /api/sadhana/template/:email
router.get('/template/:email', async (req, res) => {
    const { email } = req.params;
    console.log('[Sadhana][Template GET] req.params:', req.params);
    try {
        const [rows] = await db.execute(
            'SELECT * FROM sadhana_user_template WHERE user_email = ?', [email]
        );
        if (rows.length === 0) {
            // Default template: core fields true, optional fields false
            const defaultTemplate = {
                entry_date: true,
                wake_up_time: true,
                chanting_rounds: true,
                reading_time: true,
                reading_topic: true,
                hearing_time: true,
                hearing_topic: true,
                service_name: true,
                service_time: true,
                sleeping_time: false,
                chanting_before_700: false,
                chanting_before_730: false,
                attended_mangal_arati: false,
                attended_bhagavatam_class: false,
                book_distribution: false,
                prasadam_honored: false,
                ekadashi_followed: false,
                japa_quality: false
            };
            return res.status(200).json(defaultTemplate);
        }
        // Return all boolean fields
        const template = rows[0];
        return res.status(200).json({
            entry_date: !!template.entry_date,
            wake_up_time: !!template.wake_up_time,
            chanting_rounds: !!template.chanting_rounds,
            reading_time: !!template.reading_time,
            reading_topic: !!template.reading_topic,
            hearing_time: !!template.hearing_time,
            hearing_topic: !!template.hearing_topic,
            service_name: !!template.service_name,
            service_time: !!template.service_time,
            sleeping_time: !!template.sleeping_time,
            chanting_before_700: !!template.chanting_before_700,
            chanting_before_730: !!template.chanting_before_730,
            attended_mangal_arati: !!template.attended_mangal_arati,
            attended_bhagavatam_class: !!template.attended_bhagavatam_class,
            book_distribution: !!template.book_distribution,
            prasadam_honored: !!template.prasadam_honored,
            ekadashi_followed: !!template.ekadashi_followed,
            japa_quality: !!template.japa_quality
        });
    } catch (error) {
        console.error('❌ Error fetching sadhana template:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// POST /api/sadhana/template/:email
router.post('/template/:email', async (req, res) => {
    const { email } = req.params;
    console.log('[Sadhana][Template POST] req.params:', req.params);
    console.log('[Sadhana][Template POST] req.body:', req.body);
    const {
        userEmail,
        devoteeId,
        entryDate,
        wakeUpTime,
        chantingRounds,
        readingTime,
        readingTopic,
        hearingTime,
        hearingTopic,
        serviceName,
        serviceTime,
        sleepingTime,
        chantingBefore700,
        chantingBefore730,
        attendedMangalArati,
        attendedBhagavatamClass,
        bookDistribution,
        prasadamHonored,
        ekadashiFollowed,
        japaQuality
    } = req.body;
    try {
        const now = new Date();
        await db.execute(
            `INSERT INTO sadhana_user_template (
                user_email, devotee_id, entry_date, wake_up_time, chanting_rounds, reading_time, reading_topic,
                hearing_time, hearing_topic, service_name, service_time, sleeping_time, chanting_before_700,
                chanting_before_730, attended_mangal_arati, attended_bhagavatam_class, book_distribution,
                prasadam_honored, ekadashi_followed, japa_quality, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                devotee_id = VALUES(devotee_id),
                entry_date = VALUES(entry_date),
                wake_up_time = VALUES(wake_up_time),
                chanting_rounds = VALUES(chanting_rounds),
                reading_time = VALUES(reading_time),
                reading_topic = VALUES(reading_topic),
                hearing_time = VALUES(hearing_time),
                hearing_topic = VALUES(hearing_topic),
                service_name = VALUES(service_name),
                service_time = VALUES(service_time),
                sleeping_time = VALUES(sleeping_time),
                chanting_before_700 = VALUES(chanting_before_700),
                chanting_before_730 = VALUES(chanting_before_730),
                attended_mangal_arati = VALUES(attended_mangal_arati),
                attended_bhagavatam_class = VALUES(attended_bhagavatam_class),
                book_distribution = VALUES(book_distribution),
                prasadam_honored = VALUES(prasadam_honored),
                ekadashi_followed = VALUES(ekadashi_followed),
                japa_quality = VALUES(japa_quality),
                updated_at = VALUES(updated_at)
            `,
            [
                userEmail,
                devoteeId,
                entryDate,
                wakeUpTime,
                chantingRounds,
                readingTime,
                readingTopic,
                hearingTime,
                hearingTopic,
                serviceName,
                serviceTime,
                sleepingTime,
                chantingBefore700,
                chantingBefore730,
                attendedMangalArati,
                attendedBhagavatamClass,
                bookDistribution,
                prasadamHonored,
                ekadashiFollowed,
                japaQuality,
                now,
                now
            ]
        );
        res.status(200).json({ message: 'Sadhana template upserted successfully' });
    } catch (error) {
        console.error('❌ Error upserting sadhana template:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});



export default router;