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

export default router;