const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Importar rutas de API
const loginRoute = require('./api/auth/login');
const registerRoute = require('./api/auth/register');
const userRoute = require('./api/user');
const statsRoute = require('./api/stats/update');
const achievementsRoute = require('./api/achievements/unlock');

// Rutas de API
app.post('/api/auth/login', loginRoute);
app.post('/api/auth/register', registerRoute);
app.get('/api/user', userRoute);
app.post('/api/stats/update', statsRoute);
app.post('/api/achievements/unlock', achievementsRoute);

// Servir la aplicación principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 AsistenteEdu ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Base de datos: ${process.env.DB_PATH || './data/edubot.db'}`);
});

module.exports = app;
