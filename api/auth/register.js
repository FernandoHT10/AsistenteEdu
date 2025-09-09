// register.js (actualizado)
const bcrypt = require('bcryptjs');
const db = require('../../database');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    // Verificar si el usuario ya existe
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      
      if (existingUser) {
        return res.status(400).json({ error: 'El usuario ya existe' });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insertar nuevo usuario
      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error al crear usuario' });
          }

          const userId = this.lastID;
          
          // Crear registro de estadísticas para el usuario
          db.run(
            'INSERT INTO user_stats (user_id) VALUES (?)',
            [userId],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Error al crear estadísticas' });
              }

              res.status(201).json({ 
                message: 'Usuario registrado exitosamente',
                user: { id: userId, name, email }
              });
            }
          );
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
}