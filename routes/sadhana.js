
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

// 🔹 Get all predefined sadhana templates
// POST/PUT for predefined_template (add/update)
router.post('/predefined-templates', async (req, res) => {
    const {
        sadhanaTemplate,
        entry_date,
        wake_up_time,
        chanting_rounds,
        reading_time,
        reading_topic,
        hearing_time,
        hearing_topic,
        service_name,
        service_time,
        sleeping_time,
        chanting_before_700,
        chanting_before_730,
        attended_mangal_arati,
        attended_bhagavatam_class,
        book_distribution,
        prasadam_honored,
        ekadashi_followed,
        japa_quality,
        sixteen_round_completed_time,
        day_sleep,
        place,
        guru_puja
    } = req.body;
    try {
        const now = new Date();
        await db.execute(
            `INSERT INTO predefined_template (
                sadhana_template, entry_date, wake_up_time, chanting_rounds, reading_time, reading_topic,
                hearing_time, hearing_topic, service_name, service_time, sleeping_time, chanting_before_700,
                chanting_before_730, attended_mangal_arati, attended_bhagavatam_class, book_distribution,
                prasadam_honored, ekadashi_followed, japa_quality, sixteen_round_completed_time,
                day_sleep, place, guru_puja, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
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
                sixteen_round_completed_time = VALUES(sixteen_round_completed_time),
                day_sleep = VALUES(day_sleep),
                place = VALUES(place),
                guru_puja = VALUES(guru_puja),
                updated_at = VALUES(updated_at)
            `,
            [
                sadhanaTemplate,
                entry_date,
                wake_up_time,
                chanting_rounds,
                reading_time,
                reading_topic,
                hearing_time,
                hearing_topic,
                service_name,
                service_time,
                sleeping_time,
                chanting_before_700,
                chanting_before_730,
                attended_mangal_arati,
                attended_bhagavatam_class,
                book_distribution,
                prasadam_honored,
                ekadashi_followed,
                japa_quality,
                !!sixteen_round_completed_time,
                !!day_sleep,
                !!place,
                !!guru_puja,
                now,
                now
            ]
        );
        res.status(200).json({ message: 'Predefined template upserted successfully' });
    } catch (error) {
        console.error('❌ Error upserting predefined template:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// 🔹 Get all predefined sadhana templates
router.get('/predefined-templates', async (req, res) => {
    console.log('[PredefinedTemplates][GET] Incoming query params:', req.query);
    const { sadhana_template } = req.query;
    try {
        let rows;
        if (sadhana_template) {
            [rows] = await db.execute('SELECT * FROM predefined_template WHERE sadhana_template = ?', [sadhana_template]);
        } else {
            [rows] = await db.execute('SELECT * FROM predefined_template');
        }
        // Convert numeric fields to booleans for template fields
        const templates = rows.map(row => ({
            id: row.id,
            sadhanaTemplate: row.sadhana_template,
            entry_date: !!row.entry_date,
            wake_up_time: !!row.wake_up_time,
            chanting_rounds: !!row.chanting_rounds,
            reading_time: !!row.reading_time,
            reading_topic: !!row.reading_topic,
            hearing_time: !!row.hearing_time,
            hearing_topic: !!row.hearing_topic,
            service_name: !!row.service_name,
            service_time: !!row.service_time,
            sleeping_time: !!row.sleeping_time,
            chanting_before_700: !!row.chanting_before_700,
            chanting_before_730: !!row.chanting_before_730,
            attended_mangal_arati: !!row.attended_mangal_arati,
            attended_bhagavatam_class: !!row.attended_bhagavatam_class,
            book_distribution: !!row.book_distribution,
            prasadam_honored: !!row.prasadam_honored,
            ekadashi_followed: !!row.ekadashi_followed,
            japa_quality: !!row.japa_quality,
            sixteen_round_completed_time: !!row.sixteen_round_completed_time,
            day_sleep: !!row.day_sleep,
            place: !!row.place,
            guru_puja: !!row.guru_puja,
            created_at: row.created_at,
            updated_at: row.updated_at
        }));
        console.log('[PredefinedTemplates][GET] Returning:', templates);
        res.status(200).json(templates);
    } catch (error) {
        console.error('❌ Error fetching predefined templates:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// 🔹 Create Sadhana Entry
router.post('/add', async (req, res) => {
    console.log('Received parameters:', req.body); // Log all incoming parameters

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
    serviceTime,
    sleepingTime,
    chantingBefore700Time,
    chantingBefore730Time,
    attendedMangalAratiTime,
    attendedBhagavatamClass,
    bookDistribution,
    prasadamHonored,
    ekadashiFollowed,
    japaQuality,
    sixteenRoundCompletedTime,
    sixteen_round_completed_time, // fallback for old clients
    daySleep,
    place,
    guruPuja
} = req.body;

    // Helper to convert undefined to null
    const safe = val => typeof val === 'undefined' ? null : val;

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
                service_name, service_time, sleeping_time,
                chanting_before_700, chanting_before_730,
                attended_mangal_arati, attended_bhagavatam_class,
                book_distribution, prasadam_honored,
                ekadashi_followed, japa_quality, sixteen_round_completed_time,
                day_sleep, place, guru_puja
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(query, [
    devoteeId,
    entryDateOnly,
    safe(wakeUpTime),
    safe(chantingRounds),
    safe(readingTime),
    safe(readingTopic),
    safe(hearingTime),
    safe(hearingTopic),
    safe(serviceName),
    safe(serviceTime),
    safe(sleepingTime),
    safe(chantingBefore700Time),   // maps to chanting_before_700
    safe(chantingBefore730Time),   // maps to chanting_before_730
    safe(attendedMangalAratiTime), // maps to attended_mangal_arati
    safe(attendedBhagavatamClass),
    safe(bookDistribution),
    safe(prasadamHonored),
    safe(ekadashiFollowed),
    safe(japaQuality),
    safe(sixteenRoundCompletedTime !== undefined ? sixteenRoundCompletedTime : sixteen_round_completed_time),
    safe(daySleep),
    safe(place),
    safe(guruPuja)
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
        console.log(`[Sadhana][GET /entries/:email] Records fetched: ${entries.length}`);
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
    const pick = (...keys) => {
        for (const key of keys) {
            if (typeof req.body[key] !== 'undefined') return req.body[key];
        }
        return undefined;
    };

    const keepExistingIfBlank = (value, existingValue) => {
        if (value === undefined || value === null || value === '') return existingValue;
        return value;
    };
    
    try {
        console.log(`[Sadhana][Update by ID] Start update for id=${id}`);
        const [existingRows] = await db.execute('SELECT * FROM sadhana_entries WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            console.warn(`[Sadhana][Update by ID] Entry not found id=${id}`);
            return res.status(404).json({ error: 'Entry not found' });
        }

        const existing = existingRows[0];
        console.log('[Sadhana][Update by ID] Existing row snapshot:', {
            id: existing.id,
            user_id: existing.user_id,
            entry_date: existing.entry_date,
            wake_up_time: existing.wake_up_time,
            sleeping_time: existing.sleeping_time,
            chanting_before_700: existing.chanting_before_700,
            chanting_before_730: existing.chanting_before_730,
            attended_mangal_arati: existing.attended_mangal_arati
        });

        const payload = {
            entry_date: keepExistingIfBlank(pick('entryDate', 'entry_date'), existing.entry_date),
            wake_up_time: keepExistingIfBlank(pick('wakeUpTime', 'wake_up_time'), existing.wake_up_time),
            chanting_rounds: keepExistingIfBlank(pick('chantingRounds', 'chanting_rounds'), existing.chanting_rounds),
            reading_time: keepExistingIfBlank(pick('readingTime', 'reading_time'), existing.reading_time),
            reading_topic: keepExistingIfBlank(pick('readingTopic', 'reading_topic'), existing.reading_topic),
            hearing_time: keepExistingIfBlank(pick('hearingTime', 'hearing_time'), existing.hearing_time),
            hearing_topic: keepExistingIfBlank(pick('hearingTopic', 'hearing_topic'), existing.hearing_topic),
            service_name: keepExistingIfBlank(pick('serviceName', 'service_name'), existing.service_name),
            service_time: keepExistingIfBlank(pick('serviceTime', 'service_time'), existing.service_time),
            sleeping_time: keepExistingIfBlank(pick('sleepingTime', 'sleeping_time'), existing.sleeping_time),
            chanting_before_700: keepExistingIfBlank(pick('chantingBefore700Time', 'chantingBefore700', 'chanting_before_700'), existing.chanting_before_700),
            chanting_before_730: keepExistingIfBlank(pick('chantingBefore730Time', 'chantingBefore730', 'chanting_before_730'), existing.chanting_before_730),
            attended_mangal_arati: keepExistingIfBlank(pick('attendedMangalAratiTime', 'attendedMangalArati', 'attended_mangal_arati'), existing.attended_mangal_arati),
            attended_bhagavatam_class: keepExistingIfBlank(pick('attendedBhagavatamClass', 'attended_bhagavatam_class'), existing.attended_bhagavatam_class),
            book_distribution: keepExistingIfBlank(pick('bookDistribution', 'book_distribution'), existing.book_distribution),
            prasadam_honored: keepExistingIfBlank(pick('prasadamHonored', 'prasadam_honored'), existing.prasadam_honored),
            ekadashi_followed: keepExistingIfBlank(pick('ekadashiFollowed', 'ekadashi_followed'), existing.ekadashi_followed),
            japa_quality: keepExistingIfBlank(pick('japaQuality', 'japa_quality'), existing.japa_quality),
            sixteen_round_completed_time: keepExistingIfBlank(pick('sixteenRoundCompletedTime', 'sixteen_round_completed_time'), existing.sixteen_round_completed_time),
            day_sleep: keepExistingIfBlank(pick('daySleep', 'day_sleep'), existing.day_sleep),
            place: keepExistingIfBlank(pick('place'), existing.place),
            guru_puja: keepExistingIfBlank(pick('guruPuja', 'guru_puja'), existing.guru_puja),
        };

        const changedFields = Object.keys(payload).filter((key) => payload[key] !== existing[key]);
        console.log(`[Sadhana][Update by ID] Fields changed for id=${id}:`, changedFields);
        if (changedFields.length === 0) {
            console.log(`[Sadhana][Update by ID] No effective changes for id=${id}`);
        }
        if (changedFields.includes('entry_date')) {
            console.warn(`[Sadhana][Update by ID] entry_date changed for id=${id}:`, {
                before: existing.entry_date,
                after: payload.entry_date
            });
        }

        const params = [
            payload.entry_date,
            payload.wake_up_time,
            payload.chanting_rounds,
            payload.reading_time,
            payload.reading_topic,
            payload.hearing_time,
            payload.hearing_topic,
            payload.service_name,
            payload.service_time,
            payload.sleeping_time,
            payload.chanting_before_700,
            payload.chanting_before_730,
            payload.attended_mangal_arati,
            payload.attended_bhagavatam_class,
            payload.book_distribution,
            payload.prasadam_honored,
            payload.ekadashi_followed,
            payload.japa_quality,
            payload.sixteen_round_completed_time,
            payload.day_sleep,
            payload.place,
            payload.guru_puja,
            id
        ];
        console.log('[Sadhana][Update by ID] Params:', params);
        const query = `
            UPDATE sadhana_entries SET
                entry_date = ?, wake_up_time = ?, chanting_rounds = ?, reading_time = ?, reading_topic = ?,
                hearing_time = ?, hearing_topic = ?, service_name = ?, service_time = ?,
                sleeping_time = ?, chanting_before_700 = ?, chanting_before_730 = ?,
                attended_mangal_arati = ?, attended_bhagavatam_class = ?, book_distribution = ?,
                prasadam_honored = ?, ekadashi_followed = ?, japa_quality = ?,
                sixteen_round_completed_time = ?, day_sleep = ?, place = ?, guru_puja = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(query, params);
        console.log(`[Sadhana][Update by ID] Update result for id=${id}:`, {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows
        });

        if (result.affectedRows === 0) {
            console.warn(`[Sadhana][Update by ID] No rows affected for id=${id}`);
            return res.status(404).json({ error: 'Entry not found' });
        }

        // return the updated row
        const [rows] = await db.execute('SELECT * FROM sadhana_entries WHERE id = ?', [id]);
        if (rows.length > 0) {
            console.log('[Sadhana][Update by ID] Updated row snapshot:', {
                id: rows[0].id,
                user_id: rows[0].user_id,
                entry_date: rows[0].entry_date,
                wake_up_time: rows[0].wake_up_time,
                sleeping_time: rows[0].sleeping_time,
                chanting_before_700: rows[0].chanting_before_700,
                chanting_before_730: rows[0].chanting_before_730,
                attended_mangal_arati: rows[0].attended_mangal_arati
            });
        }
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
        console.warn(`[Sadhana][Delete by ID] Delete requested for id=${id}`);
        const [beforeRows] = await db.execute('SELECT id, user_id, entry_date, sleeping_time FROM sadhana_entries WHERE id = ?', [id]);
        console.warn('[Sadhana][Delete by ID] Row before delete:', beforeRows[0] || null);
        const [result] = await db.execute('DELETE FROM sadhana_entries WHERE id = ?', [id]);
        console.warn(`[Sadhana][Delete by ID] Delete result for id=${id}:`, {
            affectedRows: result.affectedRows
        });
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
    const rawUserId = req.query.user_id ?? req.query.userId ?? req.query.devotee_id;
    const now = new Date();
    const rawMonth = req.query.month ?? req.query.m;
    const rawYear = req.query.year ?? req.query.y;
    const month = String(rawMonth ?? (now.getMonth() + 1)).padStart(2, '0');
    const year = String(rawYear ?? now.getFullYear());
    const user_id = rawUserId;

    console.log(`[Sadhana][entries-by-month] Params: user_id=${user_id}, month=${month}, year=${year}`);
    if (!user_id) {
        console.warn('[Sadhana][entries-by-month] Missing required user_id param. Query:', req.query);
        return res.status(400).json({ message: 'user_id is required as a query param.' });
    }

    if (!/^\d{2}$/.test(month) || Number(month) < 1 || Number(month) > 12 || !/^\d{4}$/.test(year)) {
        console.warn('[Sadhana][entries-by-month] Invalid month/year params. Query:', req.query);
        return res.status(400).json({ message: 'month must be MM and year must be YYYY.' });
    }
    try {
        const dateFilter = `${year}-${month}`;
        const sql = `SELECT * FROM sadhana_entries WHERE user_id = ? AND DATE_FORMAT(entry_date, '%Y-%m') = ? ORDER BY entry_date`;
        // Inline parameters for debug SQL (for copy-paste)
        let debugSql = sql;
        debugSql = debugSql.replace('?', typeof user_id === 'string' ? `'${user_id}'` : user_id);
        debugSql = debugSql.replace('?', `'${dateFilter}'`);
        console.log('[Sadhana][GET /entries-by-month] SQL to run:', debugSql);
        const [entries] = await db.execute(sql, [user_id, dateFilter]);
        console.log(`[Sadhana][entries-by-month] Records fetched: ${entries.length} for user_id ${user_id} in ${dateFilter}`);
        res.json(entries);
    } catch (err) {
        console.error('[Sadhana][entries-by-month] Error:', err);
        res.status(500).json({ message: 'Failed to fetch sadhana entries.' });
    }
});

// 🔹 Sadhana Template Management
// GET /api/sadhana/template/:email
router.get('/template/:id', async (req, res) => {
    const { id } = req.params;
    console.log('[Sadhana][Template GET] req.params:', req.params);
    try {
        let rows;
        [rows] = await db.execute(
            'SELECT * FROM sadhana_user_template WHERE devotee_id = ?', [id]
        );
        if(rows.length === 0) {
        [rows] = await db.execute(
            'SELECT * FROM sadhana_user_template WHERE user_email = ?', [id]
        );}
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
                japa_quality: false,
                day_sleep: false,
                place: false,
                guru_puja: false
            };
            console.log('[Sadhana][Template GET] Sending default response:', defaultTemplate);
            return res.status(200).json(defaultTemplate);
        }
        // Return all boolean fields
        const template = rows[0];
        const response = {
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
            japa_quality: !!template.japa_quality,
            sixteenRoundCompletedTime: !!template.sixteen_round_completed_time,
            day_sleep: !!template.day_sleep,
            place: !!template.place,
            guru_puja: !!template.guru_puja
        };
        console.log('[Sadhana][Template GET] Sending response:', response);
        return res.status(200).json(response);
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
    const safe = val => typeof val === 'undefined' ? null : val;
    const bool = val => typeof val === 'undefined' ? 0 : !!val;
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
        japaQuality,
        sixteenRoundCompletedTime,
        sixteen_round_completed_time, // fallback for old clients
        daySleep,
        place,
        guruPuja
    } = req.body;
    try {
        const now = new Date();
        await db.execute(
            `INSERT INTO sadhana_user_template (
                user_email, devotee_id, entry_date, wake_up_time, chanting_rounds, reading_time, reading_topic,
                hearing_time, hearing_topic, service_name, service_time, sleeping_time, chanting_before_700,
                chanting_before_730, attended_mangal_arati, attended_bhagavatam_class, book_distribution,
                prasadam_honored, ekadashi_followed, japa_quality, sixteen_round_completed_time,
                day_sleep, place, guru_puja, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                sixteen_round_completed_time = VALUES(sixteen_round_completed_time),
                day_sleep = VALUES(day_sleep),
                place = VALUES(place),
                guru_puja = VALUES(guru_puja),
                updated_at = VALUES(updated_at)
            `,
            [
                safe(userEmail),
                safe(devoteeId),
                bool(entryDate),
                bool(wakeUpTime),
                bool(chantingRounds),
                bool(readingTime),
                bool(readingTopic),
                bool(hearingTime),
                bool(hearingTopic),
                bool(serviceName),
                bool(serviceTime),
                bool(sleepingTime),
                bool(chantingBefore700),
                bool(chantingBefore730),
                bool(attendedMangalArati),
                bool(attendedBhagavatamClass),
                bool(bookDistribution),
                bool(prasadamHonored),
                bool(ekadashiFollowed),
                bool(japaQuality),
                bool(sixteenRoundCompletedTime !== undefined ? sixteenRoundCompletedTime : sixteen_round_completed_time),
                bool(daySleep),
                bool(place),
                bool(guruPuja),
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