# AsistenteEdu - Tutor Educativo con IA

AsistenteEdu es una aplicación web que utiliza inteligencia artificial para crear un tutor personalizado. Los estudiantes pueden subir material de estudio, hacer preguntas, seguir planes de estudio personalizados y realizar exámenes.

## 🚀 Características

- ✅ **Sistema de autenticación real** con base de datos SQLite
- ✅ **Base de datos persistente** para usuarios y progreso
- ✅ **Autenticación segura** con JWT y hash de contraseñas
- ✅ **Sistema de niveles y XP** para gamificación
- ✅ **Logros desbloqueables** para motivar el aprendizaje
- ✅ **Chat con IA** usando Google Gemini
- ✅ **Planes de estudio personalizados**
- ✅ **Sistema de exámenes** generados automáticamente
- ✅ **Estadísticas de progreso** detalladas

## 📋 Requisitos previos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Google Cloud con API de Gemini habilitada

## 🛠️ Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd AsistenteEdu
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` y configura:
   ```env
   JWT_SECRET=tu_clave_secreta_jwt_muy_segura
   GEMINI_API_KEY=tu_api_key_de_gemini
   ```

4. **Inicializar la base de datos**
   La base de datos SQLite se creará automáticamente en `data/edubot.db` al ejecutar la aplicación por primera vez.

## 🚀 Ejecución

### Desarrollo local
```bash
npm run dev
```

### Despliegue en Vercel
```bash
npm install -g vercel
vercel deploy
```

La aplicación estará disponible en `http://localhost:3000` (desarrollo) o en la URL proporcionada por Vercel.

## 📁 Estructura del proyecto

```
AsistenteEdu/
├── api/                    # Endpoints de la API
│   ├── auth/              # Autenticación
│   │   ├── login.js       # Endpoint de login
│   │   └── register.js    # Endpoint de registro
│   ├── middleware/        # Middleware de autenticación
│   │   └── auth.js        # Verificación de JWT
│   ├── stats/             # Estadísticas de usuario
│   │   └── update.js      # Actualizar estadísticas
│   ├── achievements/      # Sistema de logros
│   │   └── unlock.js      # Desbloquear logros
│   └── user.js           # Datos del usuario
├── data/                  # Datos y base de datos
│   └── edubot.db         # Base de datos SQLite (se crea automáticamente)
├── public/               # Archivos estáticos
│   └── index.html        # Aplicación frontend
├── database.js           # Configuración de base de datos
├── package.json          # Dependencias del proyecto
├── vercel.json          # Configuración de Vercel
└── .env.example         # Variables de entorno de ejemplo
```

## 🗄️ Base de datos

El proyecto utiliza SQLite con las siguientes tablas:

### `users`
- `id`: ID único del usuario
- `name`: Nombre completo
- `email`: Correo electrónico (único)
- `password`: Contraseña hasheada
- `created_at`: Fecha de registro

### `user_stats`
- `user_id`: ID del usuario (FK)
- `materials_uploaded`: Materiales subidos
- `questions_asked`: Preguntas realizadas
- `exercises_completed`: Ejercicios completados
- `average_score`: Puntuación promedio
- `study_time`: Tiempo de estudio (minutos)
- `current_level`: Nivel actual
- `xp`: Puntos de experiencia

### `user_achievements`
- `id`: ID único del logro
- `user_id`: ID del usuario (FK)
- `achievement_id`: ID del logro desbloqueado
- `unlocked_at`: Fecha de desbloqueo

## 🔐 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Usuario
- `GET /api/user` - Obtener datos del usuario (requiere autenticación)

### Estadísticas
- `POST /api/stats/update` - Actualizar estadísticas del usuario

### Logros
- `POST /api/achievements/unlock` - Desbloquear logro

## 🎮 Sistema de gamificación

### Niveles
- **Nivel 1**: Principiante (0 XP)
- **Nivel 2**: Aprendiz (100 XP)
- **Nivel 3**: Estudiante (300 XP)
- **Nivel 4**: Avanzado (600 XP)
- **Nivel 5**: Experto (1000 XP)
- **Nivel 6**: Maestro (1500 XP)

### Logros disponibles
- **Primer material** (+25 XP): Subir el primer material de estudio
- **Primera pregunta** (+15 XP): Realizar la primera pregunta
- **Planificador** (+50 XP): Completar un plan de estudio
- **Examen aprobado** (+75 XP): Aprobar el primer examen
- **Estudiante constante** (+100 XP): Estudiar 5 días seguidos

## 🔧 Configuración de Gemini AI

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Agrega la key a tu archivo `.env`:
   ```env
   GEMINI_API_KEY=tu_api_key_aqui
   ```

## 🚀 Despliegue en producción

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente

### Variables de entorno en producción
```env
JWT_SECRET=clave_jwt_super_segura_para_produccion
GEMINI_API_KEY=tu_api_key_de_gemini
NODE_ENV=production
```

## 🐛 Solución de problemas

### Error de base de datos
- Verifica que el directorio `data/` tenga permisos de escritura
- La base de datos se crea automáticamente al iniciar la aplicación

### Error de autenticación
- Verifica que `JWT_SECRET` esté configurado en las variables de entorno
- Asegúrate de que las contraseñas tengan al menos 6 caracteres

### Error de IA
- Verifica que `GEMINI_API_KEY` esté configurado correctamente
- Comprueba que tengas créditos disponibles en Google AI

## 📝 Uso de la aplicación

1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Subir material**: Sube documentos PDF, DOCX, imágenes o texto
3. **Chat con IA**: Haz preguntas sobre el material subido
4. **Plan de estudio**: Sigue el plan personalizado generado
5. **Exámenes**: Realiza exámenes para evaluar tu progreso
6. **Progreso**: Revisa tus estadísticas y logros

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la sección de solución de problemas
2. Abre un issue en GitHub
3. Contacta al equipo de desarrollo

---

¡Disfruta aprendiendo con AsistenteEdu! 🎓✨
