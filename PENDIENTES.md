# 📋 WMTV — Documento de pendientes

> **Última actualización:** 6 de octubre de 2026
> Estado: plataforma funcional (feed, búsqueda, subida, worker FFmpeg, auth, comentarios, likes, tendencias) con tema visual futurista. Este documento recoge lo que queda por hacer, ordenado por prioridad.

---

## ✅ Estado actual (verificado)

- Backend Express (:4000) + SQLite + Redis/Bull + worker FFmpeg integrado
- Frontend React/Vite (:3002) con identidad **WMTV** (aurora, glassmorphism, Space Grotesk/Inter)
- Flujo end-to-end: registro/login → subida → proceso automático (duración + thumbnail) → publicación → feed/búsqueda/tendencias → likes/comentarios/vistas
- Rutas funcionales: `/`, `/search`, `/trending`, `/watch/:id`, `/channel/:username`, `/upload`, `/login`, `/register`
- Build de producción y renders headless verificados; integridad CSS ↔ JSX (127 clases)

---

## 🔴 P0 — Prioridad alta (bloqueantes para producción)

### 1. Persistencia real (PostgreSQL)
- [ ] El proyecto soporta PG (`server/src/db/postgres.js`) pero **SQLite está activo** por falta de Docker en el entorno.
- [ ] Levantar `docker-compose.yml` (postgres + redis + minio) y migrar datos con `DB_URL`.
- [ ] Verificar migraciones contra PG (hoy `migrate.js` es SQL de SQLite: `AUTOINCREMENT`, `datetime('now')`).
- [ ] Añadir migraciones versionadas (knex/umzug) en lugar de `CREATE TABLE IF NOT EXISTS`.

### 2. Tests automatizados
- [ ] Sin ningún test en el proyecto — la verificación es manual/E2E.
- [ ] Backend: vitest/jest + supertest (auth, feed, trending, upload, likes, comentarios).
- [ ] Frontend: React Testing Library para componentes clave + test E2E con Playwright (registro → subida → watch).

### 3. Seguridad
- [ ] Rate limiting (express-rate-limit) en `/api/auth/*` y `/api/videos/upload`.
- [ ] Validación estricta de payloads (hoy solo longitud; añadir zod/joi).
- [ ] Helmet: revisar política CSP (hoy bloquea inline scripts; considerar report-only en dev).
- [ ] Límite real de tamaño/tipo en el worker (FFmpeg sobre archivo ya escrito).
- [ ] Sanitizar HTML en comentarios (hoy se muestra como texto — verificar `react` escaping en todos los flujos).
- [ ] `JWT_SECRET` obligatorio en producción (fallar al arrancar si es el default).
- [ ] Auditoría de rutas estáticas `/api/uploads/*` (path traversal: ya se hace `join` con ruta relativa — añadir test).

---

## 🟠 P1 — Funcionalidades pendientes del producto

### 4. Rutas hoy marcadas "Próximamente"
- [ ] **Suscripciones**: tabla `subscriptions (user_id, channel_id)`, feed personalizado, contador en canal.
- [ ] **Historial**: registrar reproducciones (`user_id, video_id, watched_at`) y página correspondiente.
- [ ] **Videos que me gustan**: endpoint que filtre `video_likes.value = 1` por usuario y página real (hoy solo placeholder).

### 5. Perfil de canal
- [ ] Tabla `channels` (nombre artístico, biografía, banner, avatar, enlaces sociales).
- [ ] Editar canal desde `/channel/:username` (solo dueño).
- [ ] Subir avatar/banner (hoy es la inicial del usuario con degradado).

### 6. Reproductor
- [ ] Calidad de video / HLS (hoy reproduce el archivo original).
- [ ] Teclado: espacio (play/pause), ← → (±5 s), f (fullscreen), m (mute).
- [ ] Barra de progreso estilo YouTube (hover con preview) en vez de `<input range>`.
- [ ] Persistir posición de reproducción por usuario (localStorage mínimo).

### 7. Procesamiento de video (worker)
- [ ] **Reprocesar videos existentes**: los videos de prueba antiguos tienen `thumbnail=null` y `duration=0` (creados antes del worker real). Añadir script `npm run reprocess` que encole todos los `processing`/sin thumbnail.
- [ ] Transcodificación FFmpeg (1080p/720p/480p + HLS) — hoy solo thumbnail y duración.
- [ ] Progreso de procesado en UI (polling a `GET /videos/:id/status` o SSE).
- [ ] Webhooks/estado si el job falla 3 veces (hoy quedan en cola `failed`).

### 8. Descubrimiento
- [ ] Categorías/géneros musicales (tabla + filtro en búsqueda).
- [ ] Playlists (crear, añadir, reproducir en cola).
- [ ] Ordenar feed: recientes / populares / valorados.
- [ ] Búsqueda full-text (FTS5 en SQLite / pg_trgm o tsvector en PG) en vez de `LIKE %…%`.

---

## 🟡 P2 — Experiencia de usuario / frontend

- [ ] **Skeleton en Watch** (hoy muestra spinner) y estados vacíos consistentes.
- [ ] Notificaciones (toast) para acciones: like, subida completada, errores.
- [ ] Confirmación antes de eliminar video.
- [ ] Modo claro/tema configurable (hoy solo oscuro).
- [ ] Responsive completo: menú hamburguesa en móvil (hoy sidebar y búsqueda se ocultan).
- [ ] Paginación/infinite scroll en feed y búsqueda (los endpoints ya soportan `offset`).
- [ ] Página de error 404 real (hoy redirige al home).
- [ ] Metadatos sociales (Open Graph, Twitter cards) por video (SSR o react-helmet + og en servidor).

---

## 🟢 P3 — Infraestructura y operación

- [ ] **Procesos persistentes**: en este entorno los servicios se reinician; para despliegue usar PM2/systemd/containers.
- [ ] Logging estructurado (pino) + errores a Sentry.
- [ ] Healthchecks extendidos (`/health` con estado de Redis/DB/worker).
- [ ] CI/CD: lint + tests + build en cada push (GitHub Actions).
- [ ] Estrategia de backups de SQLite (`app.db`) si se mantiene como fallback.
- [ ] Compresión/gzip de assets y `Cache-Control` en `/api/uploads/*`.
- [ ] Variables de entorno por entorno (`.env.example` documentado — hoy el README lo cubre).

---

## 💼 P4 — Monetización y métricas (interés de inversores)

- [ ] **Dashboard de analíticas para artistas**: vistas, likes, retención, geographic/demographics (endpoint `GET /api/analytics/channel`).
- [ ] Monetización: suscripciones premium, tips/"apoyos" a artistas, anuncios pre-roll.
- [ ] Licencias/music rights: registro de obras, watermarks en video.
- [ ] Exportación de métricas (CSV/PDF) para reportes a inversores.

---

## 🧰 Deuda técnica conocida

| Ítem | Detalle |
|---|---|
| `server/src/db/postgres.js` | Importado sin usar en `processVideoService` (ya eliminado de ahí), pero el módulo crea un `Pool` aunque se use SQLite — no conectar a PG salvo `DB_URL`. |
| Fallback inline de cola | Si Redis cae, el procesamiento corre dentro del request (puede bloquear subidas grandes). Mejor: reintentos + cola persistente. |
| Videos de prueba (ids 1-2) | Archivos de 24 bytes, sin thumbnail/duración; limpiar o reprocesar. |
| Sin tests | Ver "P0 · Tests automatizados". |
| Puerto 3000/3001 ocupados | Vite usa 3002 (`strictPort` desactivado; si se libera, reconsiderar). |
| Worker separado | `WORKER_ENABLED=false` + `npm run queues` es funcional pero poco probado (SQLite doble conexión protegido por `isConnected`). |

---

## 🚀 Arranque rápido (recordatorio)

```bash
# Backend (:4000, con worker FFmpeg integrado)
cd server && npm run migrate && npm run dev

# Frontend (:3002)
cd client && npm run dev

# Usuario de prueba: test@example.com / password123
```

---

*Documento vivo: actualizarlo en cada iteración. Generado para el proyecto WMTV (wmtvmusic).*
