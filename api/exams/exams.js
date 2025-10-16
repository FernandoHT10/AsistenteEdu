const express = require('express');
const router = express.Router();
const db = require('../../database');
const auth = require('../middleware/auth');

// Crear un nuevo examen
router.post('/create', auth, (req, res) => {
    const { title, description, subject, time_limit, questions } = req.body;
    const user_id = req.user.id;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            `INSERT INTO exams (user_id, title, description, subject, time_limit, total_questions)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, title, description, subject, time_limit, questions.length],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Error al crear el examen' });
                }

                const exam_id = this.lastID;
                const stmt = db.prepare(
                    `INSERT INTO exam_questions (exam_id, question, correct_answer, options, points)
                     VALUES (?, ?, ?, ?, ?)`
                );

                let hasError = false;
                questions.forEach(q => {
                    stmt.run(
                        [exam_id, q.question, q.correct_answer, JSON.stringify(q.options), q.points],
                        (err) => {
                            if (err) hasError = true;
                        }
                    );
                });

                stmt.finalize(err => {
                    if (err || hasError) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Error al crear las preguntas del examen' });
                    }

                    db.run('COMMIT', err => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Error al finalizar la creación del examen' });
                        }
                        res.json({ 
                            id: exam_id,
                            message: 'Examen creado exitosamente' 
                        });
                    });
                });
            }
        );
    });
});

// Obtener todos los exámenes del usuario
router.get('/list', auth, (req, res) => {
    const user_id = req.user.id;
    
    db.all(
        `SELECT * FROM exams WHERE user_id = ? ORDER BY created_at DESC`,
        [user_id],
        (err, exams) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener los exámenes' });
            }
            res.json(exams);
        }
    );
});

// Obtener un examen específico con sus preguntas
router.get('/:id', auth, (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    db.get(
        `SELECT * FROM exams WHERE id = ? AND user_id = ?`,
        [id, user_id],
        (err, exam) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener el examen' });
            }
            if (!exam) {
                return res.status(404).json({ error: 'Examen no encontrado' });
            }

            db.all(
                `SELECT id, question, options, points FROM exam_questions WHERE exam_id = ?`,
                [id],
                (err, questions) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error al obtener las preguntas' });
                    }
                    exam.questions = questions.map(q => ({
                        ...q,
                        options: JSON.parse(q.options)
                    }));
                    res.json(exam);
                }
            );
        }
    );
});

// Eliminar un examen
router.delete('/delete/:id', auth, (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
            'DELETE FROM exam_questions WHERE exam_id = ?',
            [id],
            (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Error al eliminar las preguntas del examen' });
                }

                db.run(
                    'DELETE FROM exams WHERE id = ? AND user_id = ?',
                    [id, user_id],
                    function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Error al eliminar el examen' });
                        }
                        if (this.changes === 0) {
                            db.run('ROLLBACK');
                            return res.status(404).json({ error: 'Examen no encontrado' });
                        }
                        
                        db.run('COMMIT', err => {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Error al finalizar la eliminación del examen' });
                            }
                            res.json({ message: 'Examen eliminado exitosamente' });
                        });
                    }
                );
            }
        );
    });
});

module.exports = router;