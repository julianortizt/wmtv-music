# WMTV — Plataforma de Video Musical para Músicos

Sistema completo tipo YouTube renombrado **WMTV**: subida de videos con procesamiento automático FFmpeg (duración + thumbnail), reproducción, búsqueda, tendencias, comentarios, likes y canales — con identidad visual futurista.

> 📋 **Roadmap y pendientes:** ver [PENDIENTES.md](./PENDIENTES.md)

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express |
| Frontend | React 18 + Vite + React Router |
| Base de datos | PostgreSQL + SQLite (fallback sin Docker) |
| Cache / Colas | Redis + Bull |
| Almacenamiento | S3 compatible (MinIO en dev / storage local) |
| Autenticación | JWT + HTTP-only cookies + bcrypt |
| Procesamiento de video | FFmpeg vía colas Bull |
| Orquestación | Docker Compose |

## Requisitos

- Node.js ≥ 20
- npm ≥ 9
- Docker + Docker Compose (opcional, para PostgreSQL/Redis/MinIO)
- Redis (local o en Docker)
- FFmpeg (opcional, para thumbnails y transcodificación)

## Inicio rápido

### Opción A — Con Docker (recomendada para producción local)

```bash
# 1. Levantar PostgreSQL, Redis y MinIO
docker compose up -d

# 2. Instalar dependencias
cd server && npm install
cd ../client && npm install

# 3. Configurar variables de entorno
cp server/.env.example server/.env
# Editar server/.env con tus credenciales

# 4. Ejecutar migraciones
cd server && npm run migrate

# 5. (Opcional) Seed de usuario de prueba
npm run seed   # test@example.com / password123

# 6. Iniciar backend (puerto 4000)
npm run dev

# 7. En otra terminal: iniciar frontend (puerto 3000)
cd client && npm run dev
```

### Opción B — Sin Docker (SQLite + Redis local)

```bash
# 1. Instalar dependencias
cd server && npm install
cd ../client && npm install

# 2. Ejecutar migraciones SQLite (se crea server/src/data/app.db)
cd server && npm run migrate

# 3. (Opcional) Seed
npm run seed

# 4. Iniciar backend
npm run dev

# 5. En otra terminal: iniciar frontend
cd client && npm run dev
```

Abrir http://localhost:3000

## Estructura del proyecto

```
/
├── docker-compose.yml          # PostgreSQL + Redis + MinIO
├── package.json                # Scripts raíz (dev, build, migrate)
├── README.md
├── client/                     # Frontend React + Vite
│   ├── index.html
│   ├── vite.config.js          # Proxy /api → :4000
│   └── src/
│       ├── main.jsx            # Entry point
│       ├── App.jsx             # Rutas
│       ├── components/
│       │   ├── Navbar.jsx      # Barra superior + buscador
│       │   ├── Sidebar.jsx     # Menú lateral
│       │   ├── Layout.jsx      # Shell de la aplicación
│       │   ├── VideoCard.jsx   # Tarjeta de video
│       │   ├── VideoGrid.jsx   # Grid responsivo
│       │   └── VideoPlayer.jsx # Reproductor HTML5
│       ├── pages/
│       │   ├── Home.jsx        # Feed principal
│       │   ├── Search.jsx      # Búsqueda
│       │   ├── Watch.jsx       # Reproducción + comentarios + likes
│       │   ├── Channel.jsx     # Canal de usuario
│       │   ├── Upload.jsx      # Subida de video
│       │   ├── Login.jsx       # Inicio de sesión
│       │   └── Register.jsx    # Registro
│       ├── context/
│       │   └── AuthContext.jsx # Estado global de autenticación
│       ├── hooks/
│       │   └── useVideos.js    # Hook de videos (feed, search, user)
│       ├── services/
│       │   └── api.js          # Cliente axios con baseURL /api
│       └── styles/
│           └── index.css       # Estilos completos (tema oscuro)
└── server/                     # Backend Express
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js            # Entry point
        ├── config/
        │   └── storage.js      # Almacenamiento (S3 o local)
        ├── db/
        │   ├── postgres.js     # Pool PostgreSQL
        │   ├── sqlite.js       # Capa SQLite (fallback)
        │   ├── redis.js        # Cliente Redis
        │   ├── migrate.js      # Migraciones
        │   └── seed.js         # Datos de prueba
        ├── middleware/
        │   ├── auth.js         # Verificación JWT
        │   └── errorHandler.js # Manejo de errores
        ├── models/
        │   ├── User.js
        │   ├── Video.js
        │   ├── Comment.js
        │   └── Like.js
        ├── routes/
        │   ├── index.js        # Registro de rutas
        │   ├── auth.js         # Registro, login, logout, perfil
        │   ├── videos.js       # CRUD de videos
        │   └── comments.js     # Comentarios
        ├── services/
        │   ├── uploadService.js       # Multer + validaciones
        │   ├── queueService.js        # Cola Bull
        │   └── processVideoService.js # Procesado FFmpeg
        ├── validators/
        │   ├── auth.js
        │   └── video.js
        └── queues/
            └── worker.js       # Worker de colas
```

## API Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro (email, username, password) |
| POST | `/api/auth/login` | Inicio de sesión |
| POST | `/api/auth/logout` | Cierre de sesión |
| GET | `/api/auth/me` | Usuario actual (requiere auth) |

### Videos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/videos/feed` | Feed público paginado |
| GET | `/api/videos/trending` | Tendencias (ordenado por vistas) |
| GET | `/api/videos/search?q=` | Búsqueda por título/descripción |
| GET | `/api/videos/:id` | Detalle de video |
| GET | `/api/videos/user/:username` | Videos de un usuario |
| POST | `/api/videos/upload` | Subir video (requiere auth) |
| DELETE | `/api/videos/:id` | Eliminar video (autor) |
| POST | `/api/videos/:id/like` | Dar/quitar like |
| GET | `/api/videos/:id/likes` | Conteo de likes |
| POST | `/api/videos/:id/views` | Registrar visualización |

### Comentarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/comments/video/:videoId` | Comentarios de un video |
| POST | `/api/comments/video/:videoId` | Crear comentario (requiere auth) |
| DELETE | `/api/comments/:id` | Eliminar comentario (autor) |

### Salud

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Healthcheck del servidor |

## Scripts npm

### Raíz

```bash
npm run dev       # Backend + Frontend concurrentes
npm run migrate   # Ejecutar migraciones
npm run seed      # Seed de datos de prueba
npm run build     # Build de producción del frontend
```

### server/

```bash
npm run dev       # Backend con watch
npm run start     # Backend producción
npm run migrate   # Migraciones
npm run seed      # Seed
npm run queues    # Worker FFmpeg independiente (opcional)
```

> El worker de FFmpeg (thumbnails + duración + publicación) corre **automáticamente
> dentro del backend**. Para desactivarlo y correrlo en un proceso aparte usa
> `WORKER_ENABLED=false` en el entorno del servidor y `npm run queues`.

### client/

```bash
npm run dev       # Vite dev server (puerto 3002)
npm run build     # Build producción
npm run preview   # Preview del build
```

## Usuario de prueba

```
Email:    test@example.com
Password: password123
```

## Variables de entorno (server/.env)

```env
NODE_ENV=development
PORT=4000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=youtube_clone

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d

# S3 / MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=video-files

# Límites
MAX_VIDEO_SIZE_MB=500
```

## Funcionalidades

- ✅ Registro e inicio de sesión con JWT (cookies httpOnly)
- ✅ Feed de videos con paginación
- ✅ Búsqueda por título y descripción
- ✅ Subida de videos con validación de tipo y tamaño
- ✅ Reproductor HTML5 con controles personalizados
- ✅ Sistema de likes
- ✅ Comentarios en tiempo real
- ✅ Contador de visualizaciones
- ✅ Canales de usuario con lista de videos
- ✅ Eliminación de videos (solo autor)
- ✅ Diseño responsive con tema oscuro
- ✅ Colas de procesamiento de video (Bull + FFmpeg)
- ✅ Almacenamiento S3 compatible (MinIO / local)
