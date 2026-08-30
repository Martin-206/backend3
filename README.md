# ShipNow API — Pre-entrega Módulo 7

API académica desarrollada con Node.js, Express y MongoDB. El proyecto mantiene arquitectura por capas, mocking, manejo centralizado de errores, logging con Winston y documentación interactiva con Swagger/OpenAPI, testing funcional con Mocha/Chai/Supertest y carga de archivos con Multer.

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
| POST | `/api/users/:id/documents` | Subir un documento (`multipart/form-data`) |

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
| POST | `/api/deliveries/:id/proofs` | Subir un comprobante (`multipart/form-data`) |

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

## Testing funcional — Módulo 6

La pre-entrega del Módulo 6 incorpora una suite de tests funcionales automatizados con **Mocha**, **Chai** y **Supertest**.

- **Mocha** organiza y ejecuta la suite.
- **Chai** valida status HTTP, estructura y propiedades de las respuestas.
- **Supertest** realiza peticiones HTTP directamente sobre la aplicación Express, sin necesidad de iniciar manualmente un puerto.

### Separación entre aplicación y servidor

La configuración de Express se encuentra en:

```text
src/app.js
```

Ese archivo exporta `app` pero no ejecuta `app.listen()`. El levantamiento real del servidor queda en:

```text
src/index.js
```

De esta forma los tests pueden importar la aplicación directamente mediante Supertest.

### Entorno de testing

Los tests utilizan variables de entorno propias y una base MongoDB separada de desarrollo.

Copiar:

```text
.env.test.example
```

como:

```text
.env.test
```

Configuración de ejemplo:

```env
PORT=8081
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow_test
NODE_ENV=test
```

Por seguridad, la suite verifica que `NODE_ENV` sea `test` y que `MONGODB_URI` contenga la palabra `test` antes de realizar cualquier limpieza.

> La base de testing debe contener únicamente datos descartables. No utilizar una base de desarrollo o producción.

### Instalación y ejecución

Instalar las dependencias:

```bash
npm install
```

Ejecutar toda la suite:

```bash
npm test
```

Durante desarrollo también puede utilizarse:

```bash
npm run test:watch
```

### Endpoints cubiertos

La suite funcional cubre:

- `GET /api/users`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id`
- `GET /api/mocks`
- `POST /api/mocks/generate-data`
- `GET /api/logger/test`
- `GET /api/docs/`
- una ruta inexistente para comprobar el middleware global de 404.

### Casos exitosos

Se valida, entre otros comportamientos:

- listado de usuarios;
- listado de pedidos;
- creación de un pedido con un usuario generado por el propio test;
- consulta de un pedido por ID;
- actualización de un estado permitido;
- preview de mocks sin persistencia;
- inserción real de datos mock en la base de testing;
- acceso al endpoint de logger;
- acceso a Swagger UI.

### Casos de error

También se comprueban:

- pedido con datos incompletos → `400 INVALID_INPUT`;
- pedido inexistente → `404 ORDER_NOT_FOUND`;
- estado de pedido inválido → `400 INVALID_ORDER_STATUS`;
- cantidades de mocks inválidas → `400 INVALID_MOCK_COUNTS`;
- ruta inexistente → `404 ROUTE_NOT_FOUND`.

Los tests verifican tanto el status HTTP como el formato centralizado definido por el proyecto:

```json
{
  "status": "error",
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Pedido no encontrado."
  }
}
```

### Datos controlados y limpieza

Los tests no dependen de información cargada previamente. Cuando necesitan relaciones, generan sus propios datos; por ejemplo, primero crean un usuario de testing y luego utilizan su `_id` para crear un pedido.

Antes de cada test se eliminan los documentos de las colecciones de la base de testing. Al finalizar la suite se realiza una última limpieza y se cierra la conexión con MongoDB. Esto permite que los tests sean repetibles y evita que dependan del orden de ejecución.


## Carga de archivos — Módulo 7

La pre-entrega del Módulo 7 incorpora **Multer** para recibir archivos mediante `multipart/form-data`. La configuración está centralizada en:

```text
src/config/multer.js
```

Los routers no definen storage, límites ni filtros. Solo utilizan los middlewares preparados en:

```text
src/middlewares/upload.middleware.js
```

### Configuración

- Tamaño máximo: **5 MB** por archivo.
- Campo esperado: `file`.
- Tipos MIME permitidos: `application/pdf`, `image/jpeg`, `image/png`.
- Los nombres almacenados se generan con fecha + UUID para evitar colisiones.
- Los archivos se guardan en disco; MongoDB conserva **solo metadatos**.

Estructura de uploads:

```text
uploads/
├── user-documents/
└── delivery-proofs/
```

La carpeta `uploads` está excluida por `.gitignore`; los archivos subidos no deben enviarse al repositorio.

### Documentos de usuario

```http
POST /api/users/:id/documents
Content-Type: multipart/form-data
```

Campos:

- `file`: archivo obligatorio.
- `document_type`: obligatorio. Valores: `IDENTITY`, `ADDRESS_PROOF`, `LICENSE`, `OTHER`.

El usuario debe existir. Los metadatos se agregan al array `documents` del usuario.

### Comprobantes de entrega

```http
POST /api/deliveries/:id/proofs
Content-Type: multipart/form-data
```

Campo:

- `file`: archivo obligatorio.

La entrega debe existir. Los metadatos se agregan al array `proofs` y `document_type` se registra como `DELIVERY_PROOF`.

### Metadatos persistidos

Cada archivo asociado guarda únicamente:

```text
original_name
stored_name
path
mime_type
size
document_type
uploaded_at
```

El contenido binario nunca se almacena en MongoDB.

### Errores de archivos

Los errores mantienen el formato global del proyecto. Se contemplan:

- `FILE_REQUIRED` → archivo faltante.
- `INVALID_FILE_TYPE` → MIME no permitido.
- `FILE_TOO_LARGE` → supera 5 MB.
- `INVALID_DOCUMENT_TYPE` → tipo de documento no permitido.
- `UNEXPECTED_FILE_FIELD` → el campo de archivo no es `file`.
- `FILE_SAVE_ERROR` → error al guardar o asociar el archivo.
- `USER_NOT_FOUND` / `DELIVERY_NOT_FOUND` → entidad asociada inexistente.

Si Multer ya guardó el archivo pero luego falla una validación de entidad o documento, el archivo se elimina para evitar archivos aislados.

### Logging de uploads

Winston registra cargas exitosas, comprobantes asociados, intentos de tipos MIME no permitidos y errores de guardado/asociación.

### Swagger

Los dos endpoints están documentados como `multipart/form-data`, indicando el campo `file`, el tipo de documento cuando corresponde, respuestas exitosas y errores esperados.

### Tests agregados para Módulo 7

La suite funcional agrega casos para:

- documento de usuario cargado correctamente;
- archivo faltante;
- tipo de documento inválido;
- tipo MIME no permitido;
- comprobante de entrega cargado correctamente;
- comprobante asociado a una entrega inexistente.

Además, `test/setup.js` elimina la carpeta `uploads` entre pruebas para mantener los tests controlados y repetibles.
