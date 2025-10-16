const express = require('express');
const router = express.Router();
const db = require('../../database');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB límite
    }
});

// Subir un nuevo material
router.post('/upload', auth, upload.single('file'), (req, res) => {
    const { title, description, subject } = req.body;
    const user_id = req.user.id;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    db.run(
        `INSERT INTO materials (user_id, title, description, file_path, file_type, subject)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, title, description, file.path, path.extname(file.originalname), subject],
        function(err) {
            if (err) {
                // Si hay error, eliminar el archivo subido
                fs.unlinkSync(file.path);
                return res.status(500).json({ error: 'Error al guardar el material' });
            }
            res.json({ 
                id: this.lastID,
                message: 'Material subido exitosamente',
                file_path: file.path
            });
        }
    );
});

// Obtener todos los materiales del usuario
router.get('/list', auth, (req, res) => {
    const user_id = req.user.id;
    
    db.all(
        `SELECT * FROM materials WHERE user_id = ? ORDER BY uploaded_at DESC`,
        [user_id],
        (err, materials) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener los materiales' });
            }
            res.json(materials);
        }
    );
});

// Descargar un material específico
router.get('/download/:id', auth, (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    db.get(
        `SELECT * FROM materials WHERE id = ? AND user_id = ?`,
        [id, user_id],
        (err, material) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener el material' });
            }
            if (!material) {
                return res.status(404).json({ error: 'Material no encontrado' });
            }

            res.download(material.file_path, `${material.title}${material.file_type}`, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al descargar el archivo' });
                }
            });
        }
    );
});

// Eliminar un material
router.delete('/delete/:id', auth, (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    // Primero obtener la información del archivo
    db.get(
        `SELECT file_path FROM materials WHERE id = ? AND user_id = ?`,
        [id, user_id],
        (err, material) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener el material' });
            }
            if (!material) {
                return res.status(404).json({ error: 'Material no encontrado' });
            }

            // Eliminar el archivo físico
            fs.unlink(material.file_path, (err) => {
                if (err) {
                    console.error('Error al eliminar el archivo:', err);
                }

                // Eliminar el registro de la base de datos
                db.run(
                    'DELETE FROM materials WHERE id = ? AND user_id = ?',
                    [id, user_id],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Error al eliminar el material de la base de datos' });
                        }
                        res.json({ message: 'Material eliminado exitosamente' });
                    }
                );
            });
        }
    );
});

module.exports = router;