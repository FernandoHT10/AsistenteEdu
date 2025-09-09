// api/user.js
const db = require('../database');
const authenticateToken = require('./middleware/auth');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar autenticación
  authenticateToken(req, res, () => {
    const userId = req.user.id;
    
    // Obtener datos del usuario y sus estadísticas
    db.get(
      `SELECT u.id, u.name, u.email, us.* 
       FROM users u 
       LEFT JOIN user_stats us ON u.id = us.user_id 
       WHERE u.id = ?`,
      [userId],
      (err, userData) => {
        if (err) {
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        
        if (!userData) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Obtener logros del usuario
        db.all(
          `SELECT achievement_id, unlocked_at 
           FROM user_achievements 
           WHERE user_id = ?`,
          [userId],
          (err, achievements) => {
            if (err) {
              return res.status(500).json({ error: 'Error al obtener logros' });
            }

            res.status(200).json({
              user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                stats: {
                  materialsUploaded: userData.materials_uploaded || 0,
                  questionsAsked: userData.questions_asked || 0,
                  exercisesCompleted: userData.exercises_completed || 0,
                  averageScore: userData.average_score || 0,
                  studyTime: userData.study_time || 0,
                  currentLevel: userData.current_level || 1,
                  xp: userData.xp || 0
                },
                achievements: achievements || []
              }
            });
          }
        );
      }
    );
  });
}
