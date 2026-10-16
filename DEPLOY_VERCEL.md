# 🚀 Desplegar WMTV en Vercel (frontend)

Guía para subir el frontend React a Vercel. El **backend no corre en Vercel**
(necesita procesos persistentes, FFmpeg y disco escribible): se despliega aparte
(Railway, Render, Fly.io o un VPS) y Vercel lo proxya.

---

## Cómo funciona la configuración

El archivo [`vercel.json`](./vercel.json) en la **raíz** del repo ya trae todo:

| Clave | Valor | Por qué |
|---|---|---|
| `installCommand` | `npm install --prefix client` | Instala solo dependencias del frontend |
| `buildCommand` | `npm run build` | Build de Vite |
| `outputDirectory` | `client/dist` | Salida del build |
| `rewrites` `/api/*` → backend | proxy al backend | El navegador solo ve el dominio de Vercel |
| `rewrites` `/uploads/*` → backend | proxy a `/api/uploads/*` | Compatibilidad con URLs antiguas |
| `rewrites` fallback | `index.html` | Rutas de React Router (`/watch/:id`, etc.) |
| `headers` en `/api/*` | `x-vercel-enable-rewrite-caching: 0` | **Seguridad:** impide que Vercel cachee en CDN respuestas personalizadas (`/api/auth/me`, feed) |

Como todo pasa por el mismo dominio, las **cookies httpOnly** (`access_token`,
`SameSite=Lax`) funcionan sin tocar CORS.

---

## Paso a paso

### 1. Subir el código a GitHub

```bash
cd /home/noetica/wmtvmusic
git init
git add .
git commit -m "Configuración de despliegue en Vercel + fix de URLs de medios"
git remote add origin https://github.com/<TU-USUARIO>/<TU-REPO>.git
git branch -M main
git push -u origin main
```

### 2. Importar el repo en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → elige tu repo.
2. **No cambies nada más**: `vercel.json` ya define build e instalación.
3. Pulsa **Deploy**. El build debe terminar en verde.

### 3. ⚠️ Poner la URL real del backend (obligatorio)

Mientras tanto, `vercel.json` tiene el placeholder `https://TU-BACKEND.example.com`.
Busca y reemplaza **todas** las apariciones por la URL pública (HTTPS) de tu backend:

```bash
sed -i 's#https://TU-BACKEND.example.com#https://TU-BACKEND.example.com#g' vercel.json
```

*(Sustituye el segundo valor por tu URL real; o edita `vercel.json` a mano.)*

Haz **redeploy** en Vercel después de cambiarlo.

### 4. Requisitos del backend (donde lo hostees)

- URL **HTTPS** pública y `NODE_ENV=production` (las cookies se marcan `Secure`).
- **Redis** accesible + worker FFmpeg activo (`WORKER_ENABLED=true`, que es el default).
- **Disco persistente** para `server/src/uploads` (volumen en Railway/Render) —
  sin volumen, los videos desaparecen en cada redeploy. Alternativa futura: S3/R2.
- SQLite sobrevive con volumen persistente; a largo plazo conviene PostgreSQL.

### 5. Verificación end-to-end

1. Abrir la URL de Vercel → debe cargar el feed.
2. Registrarte + hacer login (recarga la página: la sesión debe persistir).
3. Subir un video → debe pasar a `published` (FFmpeg + Redis del backend).
4. Reproducirlo: el `<video>` y el thumbnail deben cargar (200 en `/api/uploads/...`).
5. Probar rutas directas: `https://<tu-app>.vercel.app/watch/<id>` (fallback SPA).

---

## Avisos y límites conocidos

- **Tamaño de subida:** los videos viajan por el proxy de Vercel hacia el backend.
  Si archivos grandes fallan con `413`, el límite del proxy es el causante →
  solución definitiva: subida directa al almacenamiento con **URL prefirmada S3/R2**
  (dependencias `@aws-sdk/s3-request-presigner` ya instaladas en el server).
- **Bug corregido en este commit:** la API devolvía `/uploads/...` pero el backend
  solo sirve en `/api/uploads/...` (verificado: 404 antes, 200 después). Cualquier
  URL antigua sigue cubierta por el rewrite de `/uploads/*`.
- **No desplegar el backend en Vercel:** no puede correr el worker FFmpeg ni Bull
  (necesitan procesos persistentes) y el filesystem es de solo lectura.

## Usuario de prueba (seed)

```
Email:    test@example.com   (o usuario: testuser)
Password: password123
```
