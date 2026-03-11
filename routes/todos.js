import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/todos?user_id=...
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    const [rows] = await db.execute(
      'SELECT * FROM devotee_todos WHERE user_id = ? ORDER BY todo_date DESC',
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /api/todos
router.post('/', async (req, res) => {
  const { user_id, todo_text, todo_date } = req.body;
  if (!user_id || !todo_text || !todo_date) {
    return res.status(400).json({ error: 'user_id, todo_text, todo_date required' });
  }
  try {
    await db.execute(
      'INSERT INTO devotee_todos (user_id, todo_text, todo_date) VALUES (?, ?, ?)',
      [user_id, todo_text, todo_date]
    );
    res.status(201).json({ message: 'Todo added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// PUT /api/todos/:id
router.put('/:id', async (req, res) => {
  const { completed } = req.body;
  const { id } = req.params;
  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed (boolean) required' });
  }
  try {
    await db.execute(
      'UPDATE devotee_todos SET completed = ? WHERE id = ?',
      [completed, id]
    );
    res.json({ message: 'Todo updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(
      'DELETE FROM devotee_todos WHERE id = ?',
      [id]
    );
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
