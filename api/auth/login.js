// login.js (actualizado)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../database');

const SECRET = process.env.JWT_SECRET || 'edubot_secret_key';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    // Buscar usuario en la base de datos
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      
      if (!user) {
        return res.status(400).json({ error: 'Usuario no encontrado' });
      }

      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Obtener estadísticas del usuario
      db.get('SELECT * FROM user_stats WHERE user_id = ?', [user.id], (err, stats) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }

        // Crear token JWT
        const token = jwt.sign(
          { id: user.id, email: user.email }, 
          SECRET, 
          { expiresIn: '7d' }
        );

        // Devolver datos del usuario (sin password)
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          stats: stats || {}
        };

        res.status(200).json({
          token,
          user: userData,
          message: 'Login exitoso'
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
}