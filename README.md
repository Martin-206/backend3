# ShipNow API — Pre-entrega Módulo 5

API académica desarrollada con Node.js, Express y MongoDB. El proyecto mantiene arquitectura por capas, mocking, manejo centralizado de errores, logging con Winston y documentación interactiva con Swagger/OpenAPI.

```text
Route → Controller → Service → Repository → Model → MongoDB
```

## Requisitos

- Node.js 20 o superior.
- MongoDB local o MongoDB Atlas.

## Instalación

```bash
npm install
```

Copiar `.env.example` como `.env` y completar:

```env
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow
NODE_ENV=development
```

Iniciar el proyecto:

```bash
npm run dev
```

Health check:

```http
GET /health
```

## Documentación Swagger / OpenAPI

Con el servidor iniciado, Swagger UI está disponible en:

```text
http://localhost:8080/api/docs
```

Si se modifica `PORT` en `.env`, debe utilizarse ese mismo puerto.

La configuración general está separada en:

```text
src/config/swagger.js
```

La documentación de endpoints se encuentra en archivos YAML:

```text
src/docs/
├── users.yaml
├── orders.yaml
├── deliveries.yaml
├── mocks.yaml
└── logger.yaml
```

Los módulos documentados están organizados con los tags **Users, Orders, Deliveries, Mocks y Logger**.

Swagger incluye schemas reutilizables para usuarios, pedidos, entregas, item de pedido, respuestas exitosas y respuestas de error. Los roles, estados y prioridades se obtienen de las constantes reales del proyecto.

## Endpoints

### Users

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/users` | Listar usuarios activos |
| GET | `/api/users/:id` | Obtener un usuario por id |
| POST | `/api/users` | Crear un usuario |
| PATCH | `/api/users/:id` | Actualizar un usuario |
| DELETE | `/api/users/:id` | Eliminar lógicamente un usuario |

Filtros opcionales: `role` y `search`.

### Orders

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/orders` | Listar pedidos activos |
| GET | `/api/orders/:id` | Obtener un pedido por id |
| POST | `/api/orders` | Crear un pedido |
| PATCH | `/api/orders/:id` | Actualizar un pedido |
| DELETE | `/api/orders/:id` | Eliminar lógicamente un pedido |

Filtros opcionales: `status`, `priority`, `user` y `search`.

Estados permitidos:

```text
PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED
```

Prioridades permitidas:

```text
LOW, NORMAL, HIGH, URGENT
```

Ejemplo de creación:

```http
POST /api/orders
Content-Type: application/json
```

```json
{
  "tracking_code": "SN-20260825-001",
  "user": "OBJECT_ID_DE_UN_USUARIO",
  "description": "Repuestos mecánicos",
  "delivery_address": "Av. San Martín 1250",
  "weight_kg": 4.75,
  "status": "PENDING",
  "priority": "NORMAL"
}
```

El usuario debe existir y `tracking_code` debe ser único.

### Deliveries

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/deliveries` | Listar entregas activas |
| GET | `/api/deliveries/:id` | Obtener una entrega por id |
| POST | `/api/deliveries` | Crear una entrega |
| PATCH | `/api/deliveries/:id` | Actualizar una entrega |
| DELETE | `/api/deliveries/:id` | Eliminar lógicamente una entrega |

Filtros opcionales: `status`, `driver` y `order`.

Estados permitidos:

```text
PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, FAILED
```

Ejemplo de creación sin repartidor asignado:

```http
POST /api/deliveries
Content-Type: application/json
```

```json
{
  "order": "OBJECT_ID_DE_UN_PEDIDO",
  "status": "PENDING",
  "estimated_at": "2026-08-26T18:00:00.000Z",
  "notes": "Entregar en recepción"
}
```

El pedido debe existir. Si se envía `driver`, el repartidor también debe existir. Cada pedido puede tener una única entrega asociada.

### Products

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/products` | Listar productos activos |
| GET | `/api/products/:id` | Obtener un producto |
| POST | `/api/products` | Crear un producto |
| PATCH | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar lógicamente un producto |

Filtros opcionales: `category`, `status` y `search`.

### Mocks

Vista previa sin guardar:

```http
GET /api/mocks?users=10&drivers=5&orders=20
```

Insertar datos de prueba:

```http
POST /api/mocks/generate-data
Content-Type: application/json
```

```json
{
  "users": 10,
  "drivers": 5,
  "orders": 20
}
```

Límites:

- `users`: 0 a 100.
- `drivers`: 0 a 50.
- `orders`: 0 a 200.
- Si `orders` es mayor que 0, debe existir al menos un usuario.
- No se aceptan campos desconocidos.

### Logger

```http
GET /api/logger/test
```

Es una herramienta interna para validar los niveles `debug`, `http`, `info`, `warning`, `error` y `fatal`; no representa una funcionalidad de negocio.

## Manejo centralizado de errores

El proyecto utiliza:

- `src/errors/error-codes.js`: diccionario de errores.
- `src/errors/custom-error.js`: error personalizado.
- `src/middlewares/error.middleware.js`: middleware global.
- `src/utils/async-handler.js`: derivación de errores asíncronos.

Formato general:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_ORDER_STATUS",
    "message": "El estado del pedido indicado no es válido.",
    "details": {
      "allowedValues": ["PENDING", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "CANCELLED"]
    }
  }
}
```

Entre los errores controlados se encuentran datos inválidos, ids inválidos, recursos inexistentes, estados o prioridades inválidas, duplicados y cantidades incorrectas de mocks.

## Logging

Winston registra eventos relevantes del servidor, conexión a MongoDB, errores, mocks y operaciones importantes de pedidos y entregas.

Los archivos rotados de error se guardan en:

```text
logs/
```

La carpeta está excluida del repositorio mediante `.gitignore`.

## Separación de responsabilidades

- **Controller:** recibe `req`, llama al Service y construye la respuesta HTTP.
- **Service:** contiene validaciones y reglas de negocio.
- **Repository:** único lugar que accede a Mongoose/MongoDB.
- **Model:** define los schemas de persistencia.
- **Middleware global:** normaliza errores y mantiene respuestas consistentes.
- **Swagger:** documenta la API sin mezclar la configuración con la lógica de las rutas.
