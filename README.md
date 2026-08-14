# ShipNow API — Pre-entrega Módulo 3

API desarrollada con arquitectura por capas y un sistema profesional y centralizado de manejo de errores.

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

## Integración del logger

El logger se utiliza para registrar eventos relevantes:

- conexión exitosa a MongoDB;
- falla crítica de conexión o arranque;
- inicio correcto del servidor;
- peticiones HTTP en desarrollo;
- rutas inexistentes y errores esperados como `warning`;
- errores inesperados como `error`;
- generación de datos mock;
- cantidades inválidas en mocks;
- inserción exitosa o fallida de datos de prueba.

El logger complementa al middleware global de errores; las respuestas HTTP siguen manteniendo el formato uniforme del Módulo 3.

## Manejo centralizado de errores

El proyecto incluye:

- `src/errors/error-codes.js`: diccionario inmutable de errores esperados.
- `src/errors/custom-error.js`: clase de error personalizada.
- `src/middlewares/error.middleware.js`: normalización, logging y respuesta global.
- `src/utils/async-handler.js`: deriva errores asíncronos al middleware.
- Middleware 404 para rutas inexistentes.

Formato de error:

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_MOCK_COUNTS",
    "message": "Las cantidades solicitadas para los mocks no son válidas.",
    "details": {
      "field": "users",
      "received": "-1",
      "min": 0,
      "max": 100
    }
  }
}
```

En `development` se incluye el stack para facilitar depuración. En producción no se expone.

## Endpoints

### Products

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/products` | Listar productos activos |
| GET | `/api/products/:id` | Obtener un producto |
| POST | `/api/products` | Crear un producto |
| PATCH | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar lógicamente un producto |

Filtros opcionales: `category`, `status` y `search`.

### Users

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/users` | Listar usuarios activos |
| GET | `/api/users/:id` | Obtener un usuario |
| POST | `/api/users` | Crear un usuario |
| PATCH | `/api/users/:id` | Actualizar un usuario |
| DELETE | `/api/users/:id` | Eliminar lógicamente un usuario |

Filtros opcionales: `role` y `search`.

### Mocks

#### Vista previa sin guardar

```http
GET /api/mocks?users=10&drivers=5&orders=20
```

#### Insertar datos de prueba

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

Límites permitidos:

- `users`: entre 0 y 100.
- `drivers`: entre 0 y 50.
- `orders`: entre 0 y 200.
- Si `orders` es mayor que 0, `users` debe ser al menos 1.
- No se aceptan campos desconocidos en la configuración de mocks.

## Ejemplos de errores para probar

Cantidad negativa:

```http
GET /api/mocks?users=-1
```

Cantidad mayor al máximo:

```http
GET /api/mocks?orders=500
```

Pedidos sin usuarios:

```http
GET /api/mocks?users=0&orders=10
```

Rol inválido:

```http
GET /api/users?role=SUPERVISOR
```

Identificador inválido:

```http
GET /api/products/abc
```

Ruta inexistente:

```http
GET /api/no-existe
```

## Separación de responsabilidades

- **Controller:** recibe `req`, llama al Service y devuelve la respuesta HTTP exitosa.
- **Service:** valida reglas de negocio y lanza errores personalizados.
- **Repository:** concentra el acceso a Mongoose y MongoDB.
- **Middleware global:** transforma todos los errores esperados y técnicos en respuestas uniformes.
