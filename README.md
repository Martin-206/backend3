# ShipNow API — Pre-entrega Módulo 8

API académica desarrollada con Node.js, Express y MongoDB. Mantiene arquitectura por capas, errores centralizados, Winston, Swagger/OpenAPI, testing funcional, carga de archivos con Multer y preparación básica para producción con paginación y Docker.

```text
Route → Controller → Service → Repository → Model → MongoDB
```

## Requisitos

- Node.js 20 o superior para ejecución local.
- MongoDB local o MongoDB Atlas.
- Docker Desktop si se desea ejecutar en contenedor.

## Variables de entorno

El proyecto valida las variables críticas al iniciar. Si falta alguna o tiene un valor inválido, la aplicación no arranca.

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow
NODE_ENV=development
LOG_LEVEL=debug
```

Hay ejemplos separados para cada entorno:

```text
.env.example
.env.test.example
.env.production.example
```

No se utiliza JWT ni servicios externos en esta versión, por lo que no hay secreto JWT ni URLs externas que configurar.

## Ejecución local

```bash
npm install
npm run dev
```

Health check:

```http
GET /health
```

Devuelve estado, entorno, uptime y timestamp sin exponer la URI de MongoDB ni otros datos sensibles.

Swagger UI:

```text
http://localhost:3000/api/docs
```

## Performance y paginación

Los listados principales de usuarios, pedidos y entregas no devuelven la colección completa. Aceptan:

```text
?page=1&limit=20
```

- `page`: entero desde 1.
- `limit`: entero entre 1 y 100.
- valores por defecto: página 1, límite 20.

Ejemplo:

```http
GET /api/orders?page=2&limit=10&status=PENDING
```

La respuesta conserva `payload` como array y agrega:

```json
{
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 35,
    "totalPages": 4,
    "hasPrevPage": true,
    "hasNextPage": true
  }
}
```

Las consultas mantienen filtros y proyecciones, usan `lean()` y aplican `skip/limit`. La carga de archivos continúa limitada a 5 MB y solo admite PDF, JPEG y PNG.

## Testing

Crear `.env.test` a partir de `.env.test.example` y ejecutar:

```bash
npm test
```

Los tests usan una base separada (`shipnow_test`), limpian sus datos y los uploads generados, y cubren Users, Orders, Mocks, Logger, Swagger, uploads, errores, paginación y health check.

## Criterio de endpoints internos en producción

Con `NODE_ENV=production`:

- `/health`: habilitado.
- `/api/docs`: habilitado para verificar/documentar el despliegue.
- `/api/mocks`: deshabilitado.
- `/api/logger/test`: deshabilitado.

Mocks y logger test son herramientas internas y no forman parte del flujo de negocio.

## Docker

El `Dockerfile` usa Node 24 Alpine, instala únicamente dependencias de producción con `npm ci --omit=dev`, copia el código necesario y ejecuta `npm start`.

Construir la imagen:

```bash
docker build -t shipnow-api .
```

Crear un archivo local `.env.production` a partir de `.env.production.example`. No debe subirse a GitHub.

Ejecutar:

```bash
docker run --rm --name shipnow-api --env-file .env.production -p 3000:3000 shipnow-api
```

Luego probar:

```text
http://localhost:3000/health
http://localhost:3000/api/docs
http://localhost:3000/api/users?page=1&limit=20
```

Si MongoDB corre directamente en Windows/macOS con Docker Desktop, desde el contenedor puede usarse `host.docker.internal` en `MONGODB_URI`. Para despliegue real también puede utilizarse una URI de MongoDB Atlas.

## Archivos excluidos

`.gitignore` y `.dockerignore` evitan incluir datos y archivos innecesarios:

```text
node_modules/
.env
.env.test
.env.production
logs/
uploads/
coverage/
.git/
archivos temporales
```

Los uploads se almacenan en disco únicamente para este ejercicio académico. En un despliegue escalable real deberían persistirse en almacenamiento externo/objeto (por ejemplo S3 o equivalente), manteniendo en MongoDB solo sus metadatos.

## Endpoints principales

- Users: `/api/users`
- Orders: `/api/orders`
- Deliveries: `/api/deliveries`
- Upload de documentos: `POST /api/users/:id/documents`
- Upload de comprobantes: `POST /api/deliveries/:id/proofs`
- Swagger: `/api/docs`
- Health: `/health`
- Mocks (no producción): `/api/mocks`
- Logger test (no producción): `/api/logger/test`

## Logging

`LOG_LEVEL` controla la verbosidad del logger. En producción se recomienda `info` o un nivel más restrictivo. Los archivos de error rotados se guardan en `logs/`, carpeta excluida del repositorio y de la imagen Docker.
