// api/stats/update.js
const db = require('../../database');
const authenticateToken = require('../middleware/auth');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar autenticación
  authenticateToken(req, res, () => {
    const userId = req.user.id;
    const { action, value = 1 } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Acción requerida' });
    }

    let updateQuery = '';
    let params = [];

    switch (action) {
      case 'material_uploaded':
        updateQuery = 'UPDATE user_stats SET materials_uploaded = materials_uploaded + ? WHERE user_id = ?';
        params = [value, userId];
        break;
      case 'question_asked':
        updateQuery = 'UPDATE user_stats SET questions_asked = questions_asked + ? WHERE user_id = ?';
        params = [value, userId];
        break;
      case 'exercise_completed':
        updateQuery = 'UPDATE user_stats SET exercises_completed = exercises_completed + ? WHERE user_id = ?';
        params = [value, userId];
        break;
      case 'update_score':
        updateQuery = 'UPDATE user_stats SET average_score = ? WHERE user_id = ?';
        params = [value, userId];
        break;
      case 'add_study_time':
        updateQuery = 'UPDATE user_stats SET study_time = study_time + ? WHERE user_id = ?';
        params = [value, userId];
        break;
      case 'add_xp':
        updateQuery = 'UPDATE user_stats SET xp = xp + ? WHERE user_id = ?';
        params = [value, userId];
        break;
      case 'level_up':
        updateQuery = 'UPDATE user_stats SET current_level = ? WHERE user_id = ?';
        params = [value, userId];
        break;
      default:
        return res.status(400).json({ error: 'Acción no válida' });
    }

    db.run(updateQuery, params, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar estadísticas' });
      }

      // Si se agregó XP, verificar si el usuario subió de nivel
      if (action === 'add_xp') {
        db.get('SELECT xp, current_level FROM user_stats WHERE user_id = ?', [userId], (err, stats) => {
          if (err) {
            return res.status(500).json({ error: 'Error al verificar nivel' });
          }

          const currentXP = stats.xp;
          const currentLevel = stats.current_level;
          
          // Lógica simple de niveles (cada 100 XP = 1 nivel)
          const newLevel = Math.floor(currentXP / 100) + 1;
          
          if (newLevel > currentLevel) {
            db.run('UPDATE user_stats SET current_level = ? WHERE user_id = ?', [newLevel, userId], (err) => {
              if (err) {
                return res.status(500).json({ error: 'Error al actualizar nivel' });
              }
              
              res.status(200).json({ 
                message: 'Estadísticas actualizadas',
                levelUp: true,
                newLevel: newLevel
              });
            });
          } else {
            res.status(200).json({ 
              message: 'Estadísticas actualizadas',
              levelUp: false
            });
          }
        });
      } else {
        res.status(200).json({ message: 'Estadísticas actualizadas' });
      }
    });
  });
}
