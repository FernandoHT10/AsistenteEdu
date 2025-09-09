// api/achievements/unlock.js
const db = require('../../database');
const authenticateToken = require('../middleware/auth');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar autenticación
  authenticateToken(req, res, () => {
    const userId = req.user.id;
    const { achievementId } = req.body;

    if (!achievementId) {
      return res.status(400).json({ error: 'ID de logro requerido' });
    }

    // Verificar si el logro ya está desbloqueado
    db.get(
      'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
      [userId, achievementId],
      (err, existing) => {
        if (err) {
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (existing) {
          return res.status(400).json({ error: 'Logro ya desbloqueado' });
        }

        // Desbloquear el logro
        db.run(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, achievementId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error al desbloquear logro' });
            }

            res.status(200).json({ 
              message: 'Logro desbloqueado',
              achievementId: achievementId
            });
          }
        );
      }
    );
  });
}
