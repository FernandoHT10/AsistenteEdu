const express = require('express');
const router = express.Router();
const db = require('../../database');
const auth = require('../middleware/auth');

// Crear una nueva tarea
router.post('/create', auth, (req, res) => {
    const { title, description, due_date, subject } = req.body;
    const user_id = req.user.id;

    db.run(
        `INSERT INTO tasks (user_id, title, description, due_date, subject, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, title, description, due_date, subject, 'pending'],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al crear la tarea' });
            }
            res.json({ 
                id: this.lastID,
                message: 'Tarea creada exitosamente' 
            });
        }
    );
});

// Obtener todas las tareas del usuario
router.get('/list', auth, (req, res) => {
    const user_id = req.user.id;
    
    db.all(
        `SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC`,
        [user_id],
        (err, tasks) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener las tareas' });
            }
            res.json(tasks);
        }
    );
});

// Actualizar el estado de una tarea
router.put('/update/:id', auth, (req, res) => {
    const { id } = req.params;
    const { status, progress } = req.body;
    const user_id = req.user.id;

    db.run(
        `UPDATE tasks 
         SET status = ?, progress = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [status, progress, id, user_id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar la tarea' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }
            res.json({ message: 'Tarea actualizada exitosamente' });
        }
    );
});

// Eliminar una tarea
router.delete('/delete/:id', auth, (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    db.run(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [id, user_id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar la tarea' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }
            res.json({ message: 'Tarea eliminada exitosamente' });
        }
    );
});

module.exports = router;